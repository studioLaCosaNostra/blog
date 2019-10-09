---
title: Color cells using keyboard shortcuts in Google Sheets
ampSettings:
  titleImage:
    path: null
tags:
  - google sheets
  - macros
  - google sheets scripts
thumbnail:
---

```gs
function colorGreenSelectedRange() {
  SpreadsheetApp.getActiveSheet().getActiveRange().setBackground('#93c47d');
};
```
