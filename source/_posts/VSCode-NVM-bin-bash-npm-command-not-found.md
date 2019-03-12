---
title: 'VSCode: NVM /bin/bash: npm: command not found'
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - vscode
  - bash
  - nodejs
  - nvm
  - npm
thumbnail: title-image.png
date: 2019-03-11
---
*When you want to run a task but you get an adventure with `bash`*
<!-- more -->

Putting the ubuntu system back together, I met a new problem I did not know. When I wanted to run the task in VSCode, but there was such a message in the console:

![Screenshot with npm command error in VSCode][screenshot-npm-command]

This should not happen because I had the [node version manager][nvm-github] already installed and downloaded the latest `node` with `npm`.
At the beginning I found out that this may be some error in the task, so I tried to run the script with `node` without `npm`, but unfortunately another error appeared:

![Screenshot with node command error in VSCode][screenshot-node-command]

I started to guess that `bash` which is run on the task does not load the `.bashrc` startup file. I made a simple check by creating a task that displays the variable set in `.bashrc`. Nothing appeared so now it was sure that this is the reason why `node` and `npm` not running. When looking for a solution, I found the code in the `.bashrc`:

```bash
# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac
```

The code above stops executing the rest of the code if bash does not start in **interactive** mode, so the *node version manager* has not been initialized. (It was added at the end of this file.)
The fastest solution is to *force* vscode to run tasks in this mode. After a few minutes of searching I found a field in the settings:

```json
{
  "terminal.integrated.shellArgs.linux": [
      "-i"
  ]
}
```

Now the tasks start correctly and everything works again without any complaints. :)

[nvm-github]: https://github.com/creationix/nvm
[screenshot-npm-command]: screenshot-npm-command-not-found.png
[screenshot-node-command]: screenshot-node-no-such-file-or-directory.png