/* ------------------------------------------------------------------
   作品数据 —— 想改名字/说明/分类，直接改这个文件就够了。

   cat: render 棚拍渲染 | scene 场景合成 | ai AI 辅助
   图片命名规则：assets/img/<slug>-800.webp 与 <slug>-1600.webp
   ------------------------------------------------------------------ */
const SITE = {
  name: "雷啟春",
  role: "工业设计 / 产品建模与渲染",
  school: "上海电机学院",
  major: "工业设计",
  grade: "大二在读",
  graduate: "2029.6",
  gpa: "3.66",
  rank: "前 10%",
  cet: "CET-4 530",
  phone: "19841483039",
  phonePretty: "198 4148 3039",
  email: "251009010226@st.sdju.edu.cn",
  target: "工业设计 / 产品设计（实习）",
  city: "上海",
};

/* 产品练习：12 张棚拍渲染 + 3 张场景合成 + 5 张 AI 辅助 */
const WORKS = [
  {
    slug: "rc-headphones",
    name: "头戴式耳机",
    en: "Headphones",
    cat: "render",
    tags: ["软硬材质", "曲面", "撞色"],
    desc: "红白撞色，重点是头梁与耳罩的软硬材质对比。耳罩的软质褶皱是这件里最花时间的地方，要让它看起来软，但不能塌。",
  },
  {
    slug: "rc-robot-vacuum",
    name: "扫地机器人",
    en: "Robot Vacuum",
    cat: "render",
    tags: ["曲面衔接", "分件", "CMF"],
    desc: "橙色环带压在深灰机身上，练习大面积曲面之间的过渡和分件线。顶部雷达单独做一层结构，避免和机身糊在一起。",
  },
  {
    slug: "rc-massage-gun",
    name: "筋膜枪",
    en: "Massage Gun",
    cat: "render",
    tags: ["贯通曲面", "人机", "配色"],
    desc: "握孔要做成贯通的完整曲面，不能靠两片拼。橙色内衬把视觉重心压在把手处，也顺便区分了软硬区域。",
  },
  {
    slug: "rc-hair-dryer",
    name: "吹风机",
    en: "Hair Dryer",
    cat: "render",
    tags: ["长筒曲面", "格栅", "线材"],
    desc: "绿色风筒配白色手柄，练习筒身到握把的连续过渡，顺手把风口格栅和电源线的走线一起处理了。",
  },
  {
    slug: "rc-sharpener",
    name: "电动削笔机",
    en: "Electric Sharpener",
    cat: "render",
    tags: ["现有产品复刻", "透明件", "分件"],
    desc: "现有产品的再建模。橙色半透明屑盒要能看见里面的铅笔屑，透明件的厚薄变化比想象中难。",
  },
  {
    slug: "rc-blender",
    name: "破壁机",
    en: "Blender",
    cat: "render",
    tags: ["玻璃", "分件", "配色"],
    desc: "玻璃杯体和底座的分件关系，透明玻璃配一点黄色做提亮。杯口和把手的连接处推倒了几次。",
  },
  {
    slug: "rc-vacuum",
    name: "手持吸尘器",
    en: "Handheld Vacuum",
    cat: "render",
    tags: ["透明件", "滤芯", "材质层次"],
    desc: "透明尘杯里能看到滤芯与锥体。这件主要练材质层次：透明、哑光、金属放在一起时，怎么让每个都还站得住。",
  },
  {
    slug: "rc-hand-dryer",
    name: "干手器",
    en: "Hand Dryer",
    cat: "render",
    tags: ["大圆角", "出风口", "分件"],
    desc: "双开口的大圆角，练大面和小圆角之间的节奏。底部出风口做得比较克制，不想让它在墙面上太吵。",
  },
  {
    slug: "rc-iron",
    name: "手持熨斗",
    en: "Iron",
    cat: "render",
    tags: ["体块", "倒角", "极简"],
    desc: "用简单的体块做倒角和分件，不加多余装饰。这件练的是克制：形体本身站不站得住。",
  },
  {
    slug: "rc-ev-charger",
    name: "充电枪",
    en: "EV Connector",
    cat: "render",
    tags: ["大曲率", "握持", "分色"],
    desc: "黑白分色的枪体，大曲率曲面加上握把的握持角度。硬质工具类产品，形体要经得住看。",
  },
  {
    slug: "rc-knife",
    name: "美工刀",
    en: "Utility Knife",
    cat: "render",
    tags: ["细节排布", "推钮", "比例"],
    desc: "黑色刀身配黄色推钮。小体积产品的细节排布很考验比例，稍大一点就假。",
  },
  {
    slug: "rc-router",
    name: "无线面板路由器",
    en: "Wall-Plate Router",
    cat: "render",
    tags: ["现有产品复刻", "曲面板", "丝印"],
    desc: "复刻现有产品的背板与面板：弧面、丝印、接口开孔的位置关系。logo 贴在曲面上时的透视和厚度，是这件想解决的事。",
  },
  {
    slug: "sc-mouse",
    name: "无线鼠标 · 场景合成",
    en: "Mouse in Scene",
    cat: "scene",
    tags: ["Photoshop 合成", "环境光", "比例"],
    desc: "把渲染好的鼠标放进真实桌面：笔记本、咖啡、窗外光。合成时要匹配色温、反射和投影，产品才不会像贴上去的。",
  },
  {
    slug: "sc-speaker",
    name: "桌面播放器 · 场景合成",
    en: "Speaker in Scene",
    cat: "scene",
    tags: ["Photoshop 合成", "暖光", "氛围"],
    desc: "木桌、黑胶机、暖光台灯。这张主要练暖色环境下的材质还原——奶油白在这种光里很容易发黄，要压住。",
  },
  {
    slug: "sc-tape",
    name: "修正带 · 场景合成",
    en: "Correction Tape in Scene",
    cat: "scene",
    tags: ["Photoshop 合成", "自然光", "遮挡"],
    desc: "窗边的斜光、摊开的笔记本、铅笔。练的是让透明件在自然光下和桌面产生正确的遮挡与阴影。",
  },
  {
    slug: "ai-robot-vacuum",
    name: "扫地机器人 · AI 场景",
    en: "Robot Vacuum · AI Scene",
    cat: "ai",
    tags: ["AI 生成环境", "场景", "比例"],
    desc: "用 AI 生成有猫的客厅地面，再把自己的模型放进去。这一步验证的是尺寸——扫地机和地毯、猫的比例对不对。",
  },
  {
    slug: "ai-blender",
    name: "破壁机 · AI 场景",
    en: "Blender · AI Scene",
    cat: "ai",
    tags: ["AI 生成环境", "餐桌", "材质"],
    desc: "早餐餐桌的场景：橙汁、草莓、大理石台面。产品在复杂背景里必须自己站住，不能被环境吃掉。",
  },
  {
    slug: "ai-sharpener",
    name: "削笔机 · AI 场景",
    en: "Sharpener · AI Scene",
    cat: "ai",
    tags: ["AI 生成环境", "儿童", "配色"],
    desc: "粉色儿童书桌，蜡笔和绘本。把它的使用语境一次说清楚——这是给小孩子用的东西。",
  },
  {
    slug: "ai-ev-charger",
    name: "充电枪 · AI 场景",
    en: "EV Connector · AI Scene",
    cat: "ai",
    tags: ["AI 生成环境", "夜景", "雨天"],
    desc: "雨夜充电站。湿地面和路灯反射是对材质的额外考验，也是这件产品最有说服力的使用场景。",
  },
  {
    slug: "ai-switch",
    name: "掌上游戏机 · AI 场景",
    en: "Handheld Console · AI Scene",
    cat: "ai",
    tags: ["AI 生成环境", "桌面", "氛围"],
    desc: "电竞桌面的 RGB 环境光。这张主要看屏幕和环境光的关系，以及产品在暗光里的轮廓是否还清楚。",
  },
];

const CATS = [
  { id: "all", label: "全部" },
  { id: "render", label: "棚拍渲染" },
  { id: "scene", label: "场景合成" },
  { id: "ai", label: "AI 辅助" },
];

/* 白模 → 渲染 对照 */
const PAIRS = [
  {
    clay: "clay-hair-dryer",
    render: "rc-hair-dryer",
    name: "吹风机",
    note: "白模阶段只处理筒身到握把的连续过渡，渲染才处理格栅和线材。",
  },
  {
    clay: "clay-robot-vacuum",
    render: "rc-robot-vacuum",
    name: "扫地机器人",
    note: "雷达模块和白模一起定位，橙色环带的曲面衔接在建模时就定好。",
  },
  {
    clay: "clay-headphones",
    render: "rc-headphones",
    name: "头戴式耳机",
    note: "耳罩的软质体积先在白模里做出来，靠曲面而不是贴图解决。",
  },
  {
    clay: "clay-ev-charger",
    render: "rc-ev-charger",
    name: "充电枪",
    note: "枪体的黑白分色线，在白模上就要确定，渲染只是换材质。",
  },
];

/* 14 件白模 */
const CLAY = [
  { slug: "clay-switch", name: "掌上游戏机" },
  { slug: "clay-headphones", name: "头戴式耳机" },
  { slug: "clay-robot-vacuum", name: "扫地机器人" },
  { slug: "clay-hair-dryer", name: "吹风机" },
  { slug: "clay-massage-gun", name: "筋膜枪" },
  { slug: "clay-ev-charger", name: "充电枪" },
  { slug: "clay-vacuum", name: "手持吸尘器" },
  { slug: "clay-speaker", name: "桌面播放器" },
  { slug: "clay-juicer", name: "榨汁机" },
  { slug: "clay-bottle", name: "奶瓶" },
  { slug: "clay-tape", name: "修正带" },
  { slug: "clay-mouse", name: "无线鼠标" },
  { slug: "clay-router", name: "面板路由器" },
  { slug: "clay-fan", name: "桌面风扇" },
];
