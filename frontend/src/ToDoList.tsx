import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BiSolidTrash } from "react-icons/bi";

interface Item {
  id: string;
  label: string;
  checked: boolean;
}

interface ToDoListProps {
  listId: string;
  handleBackButton: () => void;
}

const ToDoList: React.FC<ToDoListProps> = ({ listId, handleBackButton }) => {
  const labelRef = useRef<HTMLInputElement>(null);
  const [listData, setListData] = useState<{
    id: string;
    name: string;
    items: Item[];
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get<{
        id: string;
        name: string;
        items: Item[];
      }>(`/api/lists/${listId}`);
      setListData(response.data);
    };
    fetchData();
  }, [listId]);

  const handleCreateItem = async (label: string) => {
    const response = await axios.post<Item>(
      `/api/lists/${listData?.id}/items/`,
      { label }
    );
    setListData({ ...listData!, items: [...listData!.items, response.data] });
  };

  const handleDeleteItem = async (id: string) => {
    const updatedItems = listData!.items.filter((item) => item.id !== id);
    const response = await axios.delete(
      `/api/lists/${listData!.id}/items/${id}`
    );
    setListData({ ...listData!, items: updatedItems });
  };

  const handleCheckToggle = async (itemId: string, newState: boolean) => {
    const updatedItems = listData!.items.map((item) => {
      if (item.id === itemId) {
        return { ...item, checked: newState };
      }
      return item;
    });
    const response = await axios.patch(
      `/api/lists/${listData!.id}/checked_state`,
      { item_id: itemId, checked_state: newState }
    );
    setListData({ ...listData!, items: updatedItems });
  };

  if (listData === null) {
    return (
      <div className="ToDoList loading">
        <button className="back" onClick={handleBackButton}>
          Back
        </button>
        Loading to-do list ...
      </div>
    );
  }

  return (
    <div className="ToDoList">
      <button className="back" onClick={handleBackButton}>
        Back
      </button>
      <h1>List: {listData.name}</h1>
      <div className="box">
        <label>
          New Item:&nbsp;
          <input ref={labelRef} type="text" />
        </label>
        <button onClick={() => handleCreateItem(labelRef.current!.value)}>
          New
        </button>
      </div>
      {listData.items.length > 0 ? (
        listData.items.map((item) => (
          <div
            key={item.id}
            className={item.checked ? "item checked" : "item"}
            onClick={() => handleCheckToggle(item.id, !item.checked)}
          >
            <span>{item.checked ? "✅" : "⬜️"} </span>
            <span className="label">{item.label} </span>
            <span className="flex"></span>
            <span
              className="trash"
              onClick={(evt) => {
                evt.stopPropagation();
                handleDeleteItem(item.id);
              }}
            >
              <BiSolidTrash />
            </span>
          </div>
        ))
      ) : (
        <div className="box">There are currently no items</div>
      )}
    </div>
  );
};

export default ToDoList;
