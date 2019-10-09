---
title: Color cells using keyboard shortcuts in Google Sheets
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - google sheets
  - macros
  - google sheets scripts
thumbnail: title-image.png
date: 2019-10-09
---

While working on blog advertising, I created a special spreadsheet. Contains a list of all links to articles on the blog, which I shared on various social networks (each has its own sheet). Since I do not share all links identically, on every portal I do it quite randomly, I had to mark the links that I have already shared. I decided that I would color their cells green. Every day I choose one link for each portal. I often clicked on a different color from the color palette. Because of this I began to feel tired and irritated when marking these links. Looking for a solution to my problem, I became interested in macros as in good old Excel. Just assign a macro to the button and it's done. And this is possible in Google Sheets, but it gives us an even better opportunity, which is to connect a keyboard shortcut to the macro, which was just the perfect solution for me. Now I just need to select the appropriate cells in the worksheet, press
`CTR+ALT+SHIFT+1` and the macro colors itself for me.
Below I have described step by step how to add such improvement in your spreadsheet.

1. Open your sheets.
2. Open the script editor from the tools menu.

  ![Open script editor](1-open-script-editor.png)

3. Create function colorGreenSelectedRange.

  ![Create function colorGreenSelectedRange](2-create-function-color-green-selected-range.png)

  ```gs
  function colorGreenSelectedRange() {
    SpreadsheetApp.getActiveSheet().getActiveRange().setBackground('#93c47d');
  };
  ```
  
  The function colors the active selection range from the active sheet in green.
  **Save before you go back to the sheets.** `CTRL+S`

4. Open the macro import from the tools menu to add the function to the sheet.

  ![Open macros import](3-open-macros-import.png)

5. Add function to your sheet.

  ![Add function colorGreenSelectedRange](4-add-function-color-green-selected-range.png)

6. Open macros manager from macros in the tools menu.

  ![Open manage macros](5-open-manage-macros.png)

7. Set 1 as the keyboard shortcut for the macro.

  ![Set 1 as shortcut for macro](6-set-1-as-shortcut-for-macro.png)

That's all, now you can call the macro with the keyboard shortcut `CTRL+ALT+SHIFT+1`. It’s easy quick, and robust.
