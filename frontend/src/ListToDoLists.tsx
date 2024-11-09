import React, { useRef } from "react";
import { BiSolidTrash } from "react-icons/bi";

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
    return <div>Loading ToDo lists ...</div>;
  } else if (listSummaries.length === 0) {
    return (
      <div>
        <div>
          <label>
            New To-Do List:&nbsp;
            <input type="text" id="labelRef" ref={labelRef} />
          </label>
          <button
            onClick={() => {
              handleNewToDoList(labelRef.current!.value);
            }}
          >
            New
          </button>
        </div>
        <p>There are no todo lists</p>
      </div>
    );
  }

  return (
    <div>
      <h1>All todo lists</h1>
      <div>
        <label>
          New To-Do List:&nbsp;
          <input type="text" id="labelRef" ref={labelRef} />
        </label>
        <button
          onClick={() => {
            handleNewToDoList(labelRef.current!.value);
          }}
        >
          New
        </button>
      </div>
      {listSummaries.map((summary) => {
        return (
          <div
            key={summary.id}
            onClick={() => {
              handleSelectList(summary.id);
            }}
          >
            <span>{summary.name}</span>
            <span>({summary.item_count} items)</span>
            <span></span>
            <span
              onClick={(evt) => {
                evt.stopPropagation();
                handleDeleteToDoList(summary.id);
              }}
            >
              <BiSolidTrash />
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ListToDoLists;
