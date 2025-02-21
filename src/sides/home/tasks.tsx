import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Task } from '@/types';
import { USER_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { SERVER_ERROR } from '@/config/errors';
import Toaster from '@/utils/toaster';
import TaskCard from '@/components/home/task_card';
import Loader from '@/components/common/loader';
import Select from '@/components/filters/select';
import { ChartLine, SortAscending, WarningCircle } from '@phosphor-icons/react';
import Order from '@/components/filters/order';
import Tags from '@/components/filters/tags';

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState('deadline');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const limit = 10;

  const fetchTasks = (abortController?: AbortController, initialPage?: number) => {
    setLoading(true);

    const URL = `${USER_URL}/me/tasks?order=${order}&tags=${tags.join(',')}&priority=${priority}&is_completed=${
      status == '' ? '' : status == 'completed'
    }&page=${initialPage ? initialPage : page}&limit=${limit}`;

    getHandler(URL, abortController?.signal, true)
      .then(res => {
        if (res.statusCode === 200) {
          const taskData = res.data.tasks || [];
          if (initialPage == 1) {
            setTasks(taskData);
          } else {
            const addedTasks = [...tasks, ...taskData];
            if (addedTasks.length === tasks.length) setHasMore(false);
            setTasks(addedTasks);
          }

          setPage(prev => prev + 1);
          setLoading(false);
        } else if (res.status != -1) {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  let oldAbortController: AbortController | null = null;

  useEffect(() => {
    const abortController = new AbortController();
    if (oldAbortController) oldAbortController.abort();
    oldAbortController = abortController;

    setPage(1);
    setTasks([]);
    setHasMore(true);
    if (isDialogOpen) fetchTasks(abortController, 1);
    return () => {
      abortController.abort();
    };
  }, [order, priority, status, tags, isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={val => setIsDialogOpen(val)}>
      <DialogTrigger asChild>
        <div className="text-xs font-medium hover-underline-animation after:bg-gray-700 dark:after:bg-white cursor-pointer">
          view all
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[50%]">
        <DialogHeader>
          <DialogTitle>Tasks assigned to you</DialogTitle>
        </DialogHeader>
        <div className="flex-center gap-2 max-md:hidden mb-4">
          <Select
            fieldName="Status"
            options={['not_completed', 'completed']}
            icon={<ChartLine size={20} />}
            selectedOption={status}
            setSelectedOption={setStatus}
          />
          <Select
            fieldName="Priority"
            options={['low', 'medium', 'high']}
            icon={<WarningCircle size={20} />}
            selectedOption={priority}
            setSelectedOption={setPriority}
          />
          <Order
            fieldName="Sort By"
            options={['deadline', 'latest']}
            icon={<SortAscending size={20} />}
            selectedOption={order}
            setSelectedOption={setOrder}
          />
          <Tags selectedTags={tags} setSelectedTags={setTags} />
          {/* <Search /> */}
        </div>
        <div className="w-full flex flex-col gap-2 p-6 pt-0">
          {tasks.map((task, index) => (
            <TaskCard key={index} task={task} />
          ))}
          {loading ? (
            <Loader />
          ) : (
            tasks.length % limit == 0 &&
            hasMore && (
              <div
                onClick={() => fetchTasks()}
                className="w-fit mx-auto pt-4 text-xs text-gray-700 dark:text-white font-medium hover-underline-animation after:bg-gray-700 cursor-pointer"
              >
                Load More
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Tasks;
