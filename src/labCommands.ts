import { JupyterFrontEnd } from '@jupyterlab/application';
import { MarkdownCell } from '@jupyterlab/cells';
import { CodeMirrorEditor } from '@jupyterlab/codemirror';
import {
  INotebookTracker,
  NotebookActions,
  NotebookPanel
} from '@jupyterlab/notebook';
import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { IDisposable } from '@lumino/disposable';
import { ElementExt } from '@lumino/domutils';

export function addJLabCommands(
  app: JupyterFrontEnd,
  tracker: INotebookTracker,
  CodeMirror: CodeMirrorEditor
): Array<IDisposable> {
  const { commands, shell } = app;
  function getCurrent(args: ReadonlyPartialJSONObject): NotebookPanel | null {
    const widget = tracker.currentWidget;
    const activate = args['activate'] !== false;

    if (activate && widget) {
      shell.activateById(widget.id);
    }

    return widget;
  }
  function isEnabled(): boolean {
    return (
      tracker.currentWidget !== null &&
      tracker.currentWidget === app.shell.currentWidget
    );
  }
  const addedCommands = [
    commands.addCommand('vim:run-select-next-edit', {
      label: 'Run Cell and Edit Next Cell',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { context, content } = current;
          NotebookActions.runAndAdvance(content, context.sessionContext);
          current.content.mode = 'edit';
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:run-cell-and-edit', {
      label: 'Run Cell and Edit Cell',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { context, content } = current;
          NotebookActions.run(content, context.sessionContext);
          current.content.mode = 'edit';
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:cut-cell-and-edit', {
      label: 'Cut Cell(s) and Edit Cell',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { content } = current;
          NotebookActions.cut(content);
          content.mode = 'edit';
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:copy-cell-and-edit', {
      label: 'Copy Cell(s) and Edit Cell',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { content } = current;
          NotebookActions.copy(content);
          content.mode = 'edit';
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:paste-cell-and-edit', {
      label: 'Paste Cell(s) and Edit Cell',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { content } = current;
          NotebookActions.paste(content, 'below');
          content.mode = 'edit';
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:merge-and-edit', {
      label: 'Merge and Edit Cell',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { content } = current;
          NotebookActions.mergeCells(content);
          current.content.mode = 'edit';
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:enter-insert-mode', {
      label: 'Enter Insert Mode',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { content } = current;
          if (content.activeCell !== null) {
            const editor = content.activeCell.editor as CodeMirrorEditor;
            current.content.mode = 'edit';
            (CodeMirror as any).Vim.handleKey(editor.editor, 'i');
          }
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:leave-insert-mode', {
      label: 'Leave Insert Mode',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { content } = current;
          if (content.activeCell !== null) {
            const editor = content.activeCell.editor as CodeMirrorEditor;
            (CodeMirror as any).Vim.handleKey(editor.editor, '<Esc>');
          }
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:leave-current-mode', {
      label: 'Move Insert to Normal to Jupyter Command Mode"',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { content } = current;
          if (content.activeCell !== null) {
            const editor = content.activeCell.editor as CodeMirrorEditor;
            const vim = editor.editor.state.vim;
            // Get the current editor state
            if (
              vim.insertMode ||
              vim.visualMode ||
              vim.inputState.operator !== null ||
              vim.inputState.motion !== null ||
              vim.inputState.keyBuffer.length !== 0
            ) {
              (CodeMirror as any).Vim.handleKey(editor.editor, '<Esc>');
            } else {
              commands.execute('notebook:enter-command-mode');
            }
          }
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:select-below-execute-markdown', {
      label: 'Execute Markdown and Select Cell Below',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { content } = current;
          if (
            content.activeCell !== null &&
            content.activeCell.model.type === 'markdown'
          ) {
            (current.content.activeCell as MarkdownCell).rendered = true;
          }
          return NotebookActions.selectBelow(current.content);
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:select-above-execute-markdown', {
      label: 'Execute Markdown and Select Cell Below',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { content } = current;
          if (
            content.activeCell !== null &&
            content.activeCell.model.type === 'markdown'
          ) {
            (current.content.activeCell as MarkdownCell).rendered = true;
          }
          return NotebookActions.selectAbove(current.content);
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:select-first-cell', {
      label: 'Select First Cell',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { content } = current;
          content.activeCellIndex = 0;
          content.deselectAll();
          if (content.activeCell !== null) {
            ElementExt.scrollIntoViewIfNeeded(
              content.node,
              content.activeCell.node
            );
          }
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:select-last-cell', {
      label: 'Select Last Cell',
      execute: args => {
        const current = getCurrent(args);

        if (current) {
          const { content } = current;
          content.activeCellIndex = current.content.widgets.length - 1;
          content.deselectAll();
          if (content.activeCell !== null) {
            ElementExt.scrollIntoViewIfNeeded(
              content.node,
              content.activeCell.node
            );
          }
        }
      },
      isEnabled
    }),
    commands.addCommand('vim:center-cell', {
      label: 'Center Cell',
      execute: args => {
        const current = getCurrent(args);

        if (current && current.content.activeCell !== null) {
          const er = current.content.activeCell.inputArea.node.getBoundingClientRect();
          current.content.scrollToPosition(er.bottom, 0);
        }
      },
      isEnabled
    }),
    commands.addCommand('hack:subword-backward-deletion', {
      label: 'Subword backward deletion',
      execute: args => {
        const current = getCurrent(args);
        if (current) {
          const { content } = current;
          if (content.activeCell !== null) {
            const cEditor = (content.activeCell.editor as CodeMirrorEditor)
              .editor;
            const doc = cEditor.getDoc();
            const starts = doc.listSelections();
            // NOTE: This is non-trivial to deal with, results are often ugly, let's ignore this.
            if (
              starts.some(
                (pos: { head: { ch: any }; anchor: { ch: any } }) =>
                  pos.head.ch !== pos.anchor.ch
              )
            ) {
              // tslint:disable-next-line:no-console
              console.log('Ignored attempt to delete subword!');
              return;
            }
            // CAV: To make sure when we undo this operation, we have carets showing in
            //      their rightful positions.
            cEditor.execCommand('goSubwordLeft');
            const ends = doc.listSelections();
            doc.setSelections(starts);
            if (starts.length !== ends.length) {
              // NOTE: Edge case where select are part of the same subword, need more thoughts on this.)
              // tslint:disable-next-line:no-console
              console.log(
                'Ignored attempt to delete subword, because some selection is part of the same subword'
              );
              return;
            }
            cEditor.operation(() => {
              for (let i = 0; i < starts.length; i++) {
                doc.replaceRange('', starts[i].head, ends[i].head, '+delete');
              }
            });
          }
        }
      }
    }),
    commands.addCommand('hack:subword-forward-deletion', {
      label: 'Subword forward deletion',
      execute: args => {
        const current = getCurrent(args);
        if (current) {
          const { content } = current;
          if (content.activeCell !== null) {
            const cEditor = (content.activeCell.editor as CodeMirrorEditor)
              .editor;
            const doc = cEditor.getDoc();
            const starts = doc.listSelections();
            // NOTE: This is non-trivial to deal with, results are often ugly, let's ignore this.
            if (
              starts.some(
                (pos: { head: { ch: any }; anchor: { ch: any } }) =>
                  pos.head.ch !== pos.anchor.ch
              )
            ) {
              // tslint:disable-next-line:no-console
              console.log('Ignored attempt to delete subword!');
              return;
            }
            // CAV: To make sure when we undo this operation, we have carets showing in
            //      their rightful positions.
            cEditor.execCommand('goSubwordRight');
            const ends = doc.listSelections();
            doc.setSelections(starts);
            if (starts.length !== ends.length) {
              // NOTE: Edge case where select are part of the same subword, need more thoughts on this.)
              // tslint:disable-next-line:no-console
              console.log(
                'Ignored attempt to delete subword, because some selection is part of the same subword'
              );
              return;
            }
            cEditor.operation(() => {
              for (let i = 0; i < starts.length; i++) {
                doc.replaceRange('', starts[i].head, ends[i].head, '+delete');
              }
            });
          }
        }
      }
    }),
    commands.addCommand('hack:go-subword-left', {
      label: 'Go subword left',
      execute: args => {
        const current = getCurrent(args);
        if (current) {
          const { content } = current;
          if (content.activeCell !== null) {
            const cEditor = (content.activeCell.editor as CodeMirrorEditor)
              .editor;
            cEditor.execCommand('goSubwordLeft');
          }
        }
      }
    }),
    commands.addCommand('hack:go-subword-right', {
      label: 'Go subword right',
      execute: args => {
        const current = getCurrent(args);
        if (current) {
          const { content } = current;
          if (content.activeCell !== null) {
            const cEditor = (content.activeCell.editor as CodeMirrorEditor)
              .editor;
            cEditor.execCommand('goSubwordRight');
          }
        }
      }
    })
  ];
  return addedCommands;
}
