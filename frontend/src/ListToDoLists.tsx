import React, { useRef } from "react";
import { BiSolidTrash, BiPlus } from "react-icons/bi";

interface ToDoListSummary {
  id: string;
  name: string;
  item_count: number;
}

interface ListToDoListsProps {
  listSummaries: ToDoListSummary[] | null;
  handleSelectList: (listId: string) => void;
  handleNewToDoList: (listName: string) => any;
  handleDeleteToDoList: (listId: string) => any;
}

const ListToDoLists: React.FC<ListToDoListsProps> = ({
  listSummaries,
  handleSelectList,
  handleNewToDoList,
  handleDeleteToDoList,
}) => {
  const labelRef = useRef<HTMLInputElement>(null);

  if (listSummaries === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg text-gray-600">
          Loading ToDo lists...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        My Todo Lists
      </h1>

      <div className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            ref={labelRef}
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            placeholder="Enter list name..."
          />
          <button
            onClick={() => {
              if (labelRef.current?.value) {
                handleNewToDoList(labelRef.current.value);
                labelRef.current.value = '';
              }
            }}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <BiPlus className="text-xl" />
            New List
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {listSummaries.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            No todo lists yet. Create your first one!
          </div>
        ) : (
          listSummaries.map((summary) => (
            <div
              key={summary.id}
              className="group flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer"
              onClick={() => handleSelectList(summary.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                <span className="font-medium text-gray-700">{summary.name}</span>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                  {summary.item_count} items
                </span>
              </div>
              <button
                onClick={(evt) => {
                  evt.stopPropagation();
                  handleDeleteToDoList(summary.id);
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
              >
                <BiSolidTrash className="text-lg" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListToDoLists;