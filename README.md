# KochForge · 科赫锻造炉

<p align="center">
  <a href="https://github.com/CJX0712/koch-forge/actions/workflows/ci.yml"><img src="https://github.com/CJX0712/koch-forge/actions/workflows/ci.yml/badge.svg" alt="ci"></a>
  <a href="https://github.com/CJX0712/koch-forge/releases"><img src="https://img.shields.io/github/v/release/CJX0712/koch-forge?sort=semver" alt="release"></a>
  <a href="https://github.com/CJX0712/koch-forge/blob/main/LICENSE"><img src="https://img.shields.io/github/license/CJX0712/koch-forge" alt="license"></a>
  <img src="https://img.shields.io/badge/author-%E6%99%A8%E6%98%9F-1f6feb" alt="author">
</p>

单文件、零依赖、可离线运行的**科赫雪花（Koch snowflake）**分形锻造工具。

- 迭代细分（0–5 层），实时渲染
- 内置不变量自检：顶点数 `3·4ⁿ`、周长 `3·√3·R·(4/3)ⁿ`、Hausdorff 维 `log4/log3 ≈ 1.2619`、等边三角形凸包、确定性
- 可选「种子变体」：填种子后每条凸包随机向内外翻，生成专属混乱雪花（同种子可复现）
- 纯 JS 引擎，无外部依赖，打开 `index.html` 即用

## 数学不变量

| 量 | 公式 | 说明 |
|----|------|------|
| 顶点数 | `3 · 4ⁿ` | n 次细分后顶点数 |
| 初始边长 | `√3 · R` | 外接圆半径 R=200 |
| 周长 | `3 · √3 · R · (4/3)ⁿ` | 每层 ×4/3 |
| Hausdorff 维 | `log 4 / log 3 ≈ 1.2619` | 自相似维数 |

## 本地校验

```bash
node _smoke.js   # 10 项数学不变量测试
node _probe.js   # ASCII 渲染 + 顶点统计探针
```

## 引擎接口

```js
const Koch = require('./index.html'); // 浏览器内为全局 const Koch
Koch.kochSnowflake(n, size, seedStr); // -> [{x,y}, ...]  闭合多边形顶点（不重复首点）
Koch.perimeter(pts);                  // 闭合周长
Koch.hausdorffDim();                  // 1.2618595...
Koch.kochSegment(a, b, n, rnd);       // 单段科赫曲线
```

## 许可证

MIT — 见 [LICENSE](./LICENSE)。
