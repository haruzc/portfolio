# -*- coding: utf-8 -*-
"""把 portfolio 目录同步到 GitHub 仓库（用 REST API，不依赖本机 git）。

用法：
  python push_api.py                # 默认 haruzc/portfolio
  python push_api.py owner/repo

Token 来源（按顺序）：
  1. 环境变量 GH_TOKEN / GITHUB_TOKEN
  2. Windows 凭据管理器里的 git:https://github.com
"""
import base64
import ctypes
import ctypes.wintypes as wt
import json
import os
import sys
import urllib.error
import urllib.request

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # portfolio 根目录
SKIP_DIRS = {".git"}
REPO = sys.argv[1] if len(sys.argv) > 1 else "haruzc/portfolio"
API = "https://api.github.com"
BRANCH = "main"
COMMIT_MSG = "更新作品集内容"


class CREDENTIAL(ctypes.Structure):
    _fields_ = [
        ("Flags", wt.DWORD),
        ("Type", wt.DWORD),
        ("TargetName", wt.LPWSTR),
        ("Comment", wt.LPWSTR),
        ("LastWritten", wt.FILETIME),
        ("CredentialBlobSize", wt.DWORD),
        ("CredentialBlob", ctypes.POINTER(ctypes.c_byte)),
        ("Persist", wt.DWORD),
        ("AttributeCount", wt.DWORD),
        ("Attributes", ctypes.c_void_p),
        ("TargetAlias", wt.LPWSTR),
        ("UserName", wt.LPWSTR),
    ]


def token_from_vault(target="git:https://github.com"):
    advapi = ctypes.windll.advapi32
    ptr = ctypes.c_void_p()
    if not advapi.CredReadW(target, 1, 0, ctypes.byref(ptr)):
        return None
    try:
        cred = ctypes.cast(ptr, ctypes.POINTER(CREDENTIAL)).contents
        size = cred.CredentialBlobSize
        raw = ctypes.string_at(cred.CredentialBlob, size)
        return raw.decode("utf-16-le").rstrip("\x00")
    finally:
        advapi.CredFree(ptr)


def get_token():
    tok = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if tok:
        return tok.strip()
    return token_from_vault()


def api(method, path, payload=None, token=None):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "portfolio-push",
    }
    if token:
        headers["Authorization"] = "Bearer " + token
    if data:
        headers["Content-Type"] = "application/json; charset=utf-8"
    req = urllib.request.Request(API + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            body = r.read()
            return r.status, (json.loads(body) if body else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def collect_files():
    out = []
    for root, dirs, files in os.walk(SITE):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            if name == ".DS_Store":
                continue
            full = os.path.join(root, name)
            rel = os.path.relpath(full, SITE).replace("\\", "/")
            out.append((rel, full))
    return sorted(out)


def main():
    token = get_token()
    if not token:
        print("找不到 GitHub token。请先运行一次 gh auth login，或设置 GH_TOKEN 环境变量。")
        return 1

    code, me = api("GET", "/user", token=token)
    if code != 200:
        print("token 无效或过期：", code, me)
        return 1
    print("账号：", me["login"])

    files = collect_files()
    print(f"本地 {len(files)} 个文件，开始上传…")

    entries = []
    for i, (rel, full) in enumerate(files, 1):
        raw = open(full, "rb").read()
        code, res = api("POST", f"/repos/{REPO}/git/blobs",
                        {"content": base64.b64encode(raw).decode("ascii"), "encoding": "base64"}, token)
        if code not in (200, 201):
            print(f"  上传失败 {rel}: {code}")
            return 1
        entries.append({"path": rel, "mode": "100644", "type": "blob", "sha": res["sha"]})
        if i % 15 == 0 or i == len(files):
            print(f"  {i}/{len(files)}")

    code, tree = api("POST", f"/repos/{REPO}/git/trees", {"tree": entries}, token)
    if code not in (200, 201):
        print("建 tree 失败：", code, tree)
        return 1

    code, ref = api("GET", f"/repos/{REPO}/git/ref/heads/{BRANCH}", token=token)
    parents = []
    if code == 200:
        parents = [ref["object"]["sha"]]
        code2, cur = api("GET", f"/repos/{REPO}/git/commits/{parents[0]}", token=token)
        if code2 == 200 and cur["tree"]["sha"] == tree["sha"]:
            print("内容没有变化，跳过。")
            print(f"线上地址：https://{REPO.split('/')[0]}.github.io/{REPO.split('/')[1]}/")
            return 0

    code, commit = api("POST", f"/repos/{REPO}/git/commits",
                       {"message": COMMIT_MSG, "tree": tree["sha"], "parents": parents}, token)
    if code not in (200, 201):
        print("建 commit 失败：", code, commit)
        return 1

    if parents:
        code, res = api("PATCH", f"/repos/{REPO}/git/refs/heads/{BRANCH}",
                        {"sha": commit["sha"], "force": False}, token)
    else:
        code, res = api("POST", f"/repos/{REPO}/git/refs",
                        {"ref": f"refs/heads/{BRANCH}", "sha": commit["sha"]}, token)
    if code not in (200, 201):
        print("更新分支失败：", code, res)
        return 1

    owner, name = REPO.split("/")
    print("已推送 commit:", commit["sha"][:10])
    print(f"线上地址：https://{owner}.github.io/{name}/ （约 1 分钟后生效）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
