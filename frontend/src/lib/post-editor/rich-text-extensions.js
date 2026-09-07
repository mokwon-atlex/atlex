import { mergeAttributes, Node } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { createBlockContent } from "@/lib/post-editor/rich-text-utils";

function createParagraphVariant(name, dataType) {
  return Node.create({
    name,
    group: "block",
    content: "inline*",
    defining: true,
    parseHTML() {
      return [{ tag: `p[data-type="${dataType}"]` }];
    },
    renderHTML({ HTMLAttributes }) {
      return [
        "p",
        mergeAttributes(HTMLAttributes, {
          "data-type": dataType,
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
            editor.isActive(this.name)
              ? commands.setParagraph()
              : commands.setNode(this.name),
      };
    },
  });
}

const LeadParagraph = createParagraphVariant(
  "leadParagraph",
  "lead-paragraph",
);

const CaptionParagraph = createParagraphVariant(
  "captionParagraph",
  "caption-paragraph",
);

// StarterKit에 없는 편집기 전용 블록은 커스텀 노드로 만들어서 사이드바 버튼과 연결한다.
const DetailsBlock = Node.create({
  name: "detailsBlock",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      title: {
        default: "토글 제목",
      },
    };
  },
  parseHTML() {
    return [{ tag: 'details[data-type="details-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const { title, ...restAttributes } = HTMLAttributes;

    return [
      "details",
      mergeAttributes(restAttributes, {
        "data-type": "details-block",
        open: "open",
      }),
      ["summary", { class: "post-editor-block__summary" }, title],
      ["div", { class: "post-editor-block__body" }, 0],
    ];
  },
  addCommands() {
    return {
      insertDetailsBlock:
        (attributes = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              title: attributes.title?.trim() || "토글 제목",
            },
            content: createBlockContent(
              attributes.content?.trim() || "토글 내용을 입력하세요.",
            ),
          }),
    };
  },
});

const CalloutBox = Node.create({
  name: "calloutBox",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      title: {
        default: "알림",
      },
    };
  },
  parseHTML() {
    return [{ tag: 'section[data-type="callout-box"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const { title, ...restAttributes } = HTMLAttributes;

    return [
      "section",
      mergeAttributes(restAttributes, {
        "data-type": "callout-box",
      }),
      ["div", { class: "post-editor-block__label" }, title],
      ["div", { class: "post-editor-block__body" }, 0],
    ];
  },
  addCommands() {
    return {
      insertCalloutBox:
        (attributes = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              title: attributes.title?.trim() || "알림",
            },
            content: createBlockContent(
              attributes.content?.trim() || "알림 내용을 입력하세요.",
            ),
          }),
    };
  },
});

const SectionBlock = Node.create({
  name: "sectionBlock",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      title: {
        default: "구분 영역",
      },
    };
  },
  parseHTML() {
    return [{ tag: 'section[data-type="section-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const { title, ...restAttributes } = HTMLAttributes;

    return [
      "section",
      mergeAttributes(restAttributes, {
        "data-type": "section-block",
      }),
      ["div", { class: "post-editor-block__label" }, title],
      ["div", { class: "post-editor-block__body" }, 0],
    ];
  },
  addCommands() {
    return {
      insertSectionBlock:
        (attributes = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              title: attributes.title?.trim() || "구분 영역",
            },
            content: createBlockContent(
              attributes.content?.trim() || "영역 내용을 입력하세요.",
            ),
          }),
    };
  },
});

const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  content: "text*",
  marks: "",
  code: true,
  defining: true,
  parseHTML() {
    return [{ tag: 'div[data-type="math-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "math-block",
      }),
      ["div", { class: "post-editor-block__label" }, "수식 (LaTeX)"],
      ["pre", { class: "post-editor-block__body" }, ["code", 0]],
    ];
  },
  addCommands() {
    return {
      insertMathBlock:
        (latex = "E = mc^2") =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [{ type: "text", text: latex }],
          }),
    };
  },
});

// 실제로 사용할 확장 목록을 한 곳에 모아 두면, 어떤 서식이 가능한지 빠르게 파악할 수 있다.
export const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Underline,
  Link.configure({
    autolink: true,
    defaultProtocol: "https",
    linkOnPaste: true,
    openOnClick: false,
  }),
  Image.configure({
    allowBase64: true,
  }),
  TextAlign.configure({
    types: [
      "blockquote",
      "captionParagraph",
      "calloutBox",
      "detailsBlock",
      "heading",
      "leadParagraph",
      "paragraph",
      "sectionBlock",
    ],
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
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
  CalloutBox,
  SectionBlock,
  MathBlock,
];
