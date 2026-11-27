import { mergeAttributes, Node } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockNodeView from '@/components/domain/post-editor/ui/CodeBlockNodeView';
import DetailsBlockNodeView from '@/components/domain/post-editor/ui/DetailsBlockNodeView';
import MathBlockNodeView from '@/components/domain/post-editor/ui/MathBlockNodeView';
import { AiSuggestionExtension } from '@/lib/post-editor/rich-text-ai-extension';
import { editorLowlight } from '@/lib/post-editor/rich-text-code';
import { FormatResetExtension } from '@/lib/post-editor/rich-text-format-reset-extension';
import { PostLinkExtension } from '@/lib/post-editor/rich-text-post-link-extension';
import { SlashCommandExtension } from '@/lib/post-editor/rich-text-slash-command-extension';
import { createBlockContent } from '@/lib/post-editor/rich-text-utils';

function createParagraphVariant(name, dataType) {
  return Node.create({
    name,
    group: 'block',
    content: 'inline*',
    defining: true,
    parseHTML() {
      return [{ tag: `p[data-type="${dataType}"]` }];
    },
    renderHTML({ HTMLAttributes }) {
      return [
        'p',
        mergeAttributes(HTMLAttributes, {
          'data-type': dataType,
        }),
        0,
      ];
    },
    addCommands() {
      return {
        [`set${name[0].toUpperCase()}${name.slice(1)}`]:
          () =>
          ({ commands }) =>
            commands.setNode(this.name),
        [`toggle${name[0].toUpperCase()}${name.slice(1)}`]:
          () =>
          ({ editor, commands }) =>
            editor.isActive(this.name) ? commands.setParagraph() : commands.setNode(this.name),
      };
    },
  });
}

const LeadParagraph = createParagraphVariant('leadParagraph', 'lead-paragraph');

const CaptionParagraph = createParagraphVariant('captionParagraph', 'caption-paragraph');

// StarterKit에 없는 편집기 전용 블록은 커스텀 노드로 만들어서 사이드바 버튼과 연결한다.
const DetailsBlock = Node.create({
  name: 'detailsBlock',
  group: 'block',
  content: 'block+',
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      title: {
        default: '토글 제목',
      },
    };
  },
  parseHTML() {
    return [{ tag: 'details[data-type="details-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const { title, ...restAttributes } = HTMLAttributes;

    return [
      'details',
      mergeAttributes(restAttributes, {
        'data-type': 'details-block',
        open: 'open',
      }),
      ['summary', { class: 'post-editor-block__summary' }, title],
      ['div', { class: 'post-editor-block__body' }, 0],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(DetailsBlockNodeView);
  },
  addCommands() {
    return {
      insertDetailsBlock:
        (attributes = {}) =>
        ({ commands }) => {
          const bodyText = attributes.content?.trim();
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: attributes.title?.trim() || '토글 제목',
            },
            content: bodyText ? createBlockContent(bodyText) : [{ type: 'paragraph' }],
          });
        },
    };
  },
});

const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  addStorage() {
    return {
      openModal: null,
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-type="math-block"]',
        // 라벨(.post-editor-block__label) 텍스트가 수식 본문에 섞이지 않도록 code 영역만 파싱한다.
        contentElement: 'pre code',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'math-block',
      }),
      ['div', { class: 'post-editor-block__label' }, '수식 (LaTeX)'],
      ['pre', { class: 'post-editor-block__body' }, ['code', 0]],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MathBlockNodeView);
  },
  addCommands() {
    return {
      insertMathBlock:
        (latex = 'E = mc^2') =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [{ type: 'text', text: latex }],
          }),
      updateMathBlockAt:
        (pos, latex) =>
        ({ tr, state, dispatch }) => {
          if (typeof pos !== 'number' || !latex?.trim()) {
            return false;
          }
          const node = state.doc.nodeAt(pos);
          if (!node || node.type.name !== this.name) {
            return false;
          }
          if (dispatch) {
            const nextNode = this.type.create(node.attrs, state.schema.text(latex.trim()));
            tr.replaceWith(pos, pos + node.nodeSize, nextNode);
          }
          return true;
        },
    };
  },
});

const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      download: {
        default: null,
        parseHTML: (element) => element.getAttribute('download'),
        renderHTML: (attributes) => (attributes.download ? { download: attributes.download } : {}),
      },
      'data-file-attachment': {
        default: null,
        parseHTML: (element) => element.getAttribute('data-file-attachment'),
        renderHTML: (attributes) =>
          attributes['data-file-attachment'] ? { 'data-file-attachment': attributes['data-file-attachment'] } : {},
      },
    };
  },
});

// 실제로 사용할 확장 목록을 한 곳에 모아 두면, 어떤 서식이 가능한지 빠르게 파악할 수 있다.
export const editorExtensions = [
  StarterKit.configure({
    codeBlock: false,
    heading: {
      levels: [1, 2, 3],
    },
    link: false,
  }),
  CustomLink.configure({
    autolink: true,
    defaultProtocol: 'https',
    linkOnPaste: true,
    openOnClick: true,
    HTMLAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  }),
  CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockNodeView);
    },
  }).configure({
    lowlight: editorLowlight,
    defaultLanguage: 'plaintext',
  }),
  Image.configure({
    allowBase64: true,
  }),
  TextAlign.configure({
    types: ['blockquote', 'captionParagraph', 'detailsBlock', 'heading', 'leadParagraph', 'paragraph'],
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  LeadParagraph,
  CaptionParagraph,
  DetailsBlock,
  MathBlock,
  SlashCommandExtension,
  AiSuggestionExtension,
  PostLinkExtension,
  FormatResetExtension,
];
