import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Community, Event, Opening, Organization, Project, User } from '@/types';
import Toaster from '@/utils/toaster';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Props as TippyProps, Instance as TippyInstance } from 'tippy.js';
import MentionList from './mention-list';

export type FetchResponse = {
  communities?: Community[];
  users?: User[];
  events?: Event[];
  orgs?: Organization[];
  openings?: Opening[];
  projects?: Project[];
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  //TODO: pass query in props and make request in the comp
  items: ({ query }: { query: string }) => {
    const fetchUsers = async (search: string) => {
      const URL = `${EXPLORE_URL}/quick?search=${search}&limit=${5}`;
      const res = await getHandler(URL, undefined, true);
      if (res.statusCode == 200) {
        const response: FetchResponse = res.data;

        return [response];
      } else {
        if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
        else Toaster.error(SERVER_ERROR, 'error_toaster');
        return [];
      }
    };

    return fetchUsers(query);
  },

  render: () => {
    let component: any;
    let popup: TippyInstance<TippyProps>[];

    return {
      //TODO: IDEA: can pass query as prop and make request in the comp with useEffect
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
          zIndex: 99999,
          sticky: 'popper'
        });
      },

      onUpdate(props: any) {
        //TODO: Throttling
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();

          return true;
        }

        return component.ref?.onKeyDown(props);
      },

      onExit() {
        if (popup[0]) popup[0].destroy();
        if (component) component.destroy();
      },
    };
  },
};
