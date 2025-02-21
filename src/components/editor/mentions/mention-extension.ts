import MentionHoverCard from '@/components/editor/mentions/mention-hover-card';
import Mention from '@tiptap/extension-mention';
import { mergeAttributes, ReactRenderer } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';
import MentionSuggestions from './mention-suggestions';

const InteractMentions = Mention.configure({
  HTMLAttributes: {
    class: 'mention',
  },
  suggestion: MentionSuggestions,
}).extend({
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-mention-id'),
        renderHTML: attributes => ({ 'data-mention-id': attributes.id }),
      },
      category: {
        default: null,
        parseHTML: element => element.getAttribute('data-mention-category'),
        renderHTML: attributes => {
          return {
            'data-mention-category': attributes.category,
          };
        },
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-mention-label'),
        renderHTML: attributes => ({ 'data-mention-label': attributes.label }),
      },
      href: {
        default: '#',
        parseHTML: element => element.getAttribute('data-mention-href'),
        renderHTML: attributes => ({ 'data-mention-href': attributes.href }),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    //TODO: custom color for different categories
    return [
      'span',
      mergeAttributes({ 'data-type': this.name }, this.options.HTMLAttributes, HTMLAttributes),
      `@${node.attrs.label}`,
    ];
  },
  addNodeView() {
    return ({ node, editor }) => {
      let tippyInstance: Instance | null = null;
      const dom = document.createElement('span');
      dom.className = 'mention';
      dom.setAttribute('data-mention-label', node.attrs.label);
      dom.setAttribute('data-mention-category', node.attrs.category);
      dom.textContent = `@${node.attrs.label}`;

      const onClick = () => {
        const href = node.attrs.href;
        if (typeof window !== 'undefined') {
          window.location.href = href;
        }
      };

      const onMouseEnter = () => {
        const container = document.createElement('div');

        //TODO check if this renders on mouseenter or just appears on mouseenter, to optimize unnecessary api calls for items
        const renderer = new ReactRenderer(MentionHoverCard, {
          props: {
            id: node.attrs.id,
            category: node.attrs.category,
          },
          editor: editor,
        });

        container.append(renderer.element);

        tippyInstance = tippy(dom, {
          content: container,
          interactive: true,
          placement: 'bottom-start',
          trigger: 'mouseenter',
          inertia: true,
          // arrow: true,
          // offest: [0, 10],
          // animation: 'scale',
          // duration: [200, 200],
          delay: 1000,
          hideOnClick: false,
          appendTo: () => document.body,
          onHidden: () => renderer.destroy(),
        });

        tippyInstance.show();
      };

      const onMouseLeave = () => {
        if (tippyInstance) {
          tippyInstance.hide();
        }
      };

      dom.addEventListener('click', onClick);
      dom.addEventListener('mouseenter', onMouseEnter);
      dom.addEventListener('mouseleave', onMouseLeave);

      return {
        dom,
        destroy() {
          dom.removeEventListener('mouseenter', onMouseEnter);
          dom.removeEventListener('mouseleave', onMouseLeave);
          dom.removeEventListener('click', onClick);
          if (tippyInstance) {
            tippyInstance.destroy();
          }
        },
      };
    };
  },
});

export default InteractMentions;
