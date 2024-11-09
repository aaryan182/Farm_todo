import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BiSolidTrash, BiArrowBack, BiPlus } from "react-icons/bi";

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
    if (!label.trim()) return;
    const response = await axios.post<Item>(
      `/api/lists/${listData?.id}/items/`,
      { label }
    );
    setListData({ ...listData!, items: [...listData!.items, response.data] });
  };

  const handleDeleteItem = async (id: string) => {
    const updatedItems = listData!.items.filter((item) => item.id !== id);
    await axios.delete(`/api/lists/${listData!.id}/items/${id}`);
    setListData({ ...listData!, items: updatedItems });
  };

  const handleCheckToggle = async (itemId: string, newState: boolean) => {
    const updatedItems = listData!.items.map((item) => {
      if (item.id === itemId) {
        return { ...item, checked: newState };
      }
      return item;
    });
    await axios.patch(`/api/lists/${listData!.id}/checked_state`, {
      item_id: itemId,
      checked_state: newState,
    });
    setListData({ ...listData!, items: updatedItems });
  };

  if (listData === null) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <button
          onClick={handleBackButton}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <BiArrowBack /> Back
        </button>
        <div className="animate-pulse text-center py-8 text-gray-600">
          Loading todo list...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <button
        onClick={handleBackButton}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
      >
        <BiArrowBack className="group-hover:-translate-x-1 transition-transform" />
        <span>Back</span>
      </button>

      <h1 className="text-3xl font-bold mb-8 text-gray-800">{listData.name}</h1>

      <div className="mb-8">
        <div className="flex gap-2">
          <input
            ref={labelRef}
            type="text"
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            placeholder="Add new item..."
            onKeyPress={(e) => {
              if (e.key === "Enter" && labelRef.current?.value) {
                handleCreateItem(labelRef.current.value);
                labelRef.current.value = "";
              }
            }}
          />
          <button
            onClick={() => {
              if (labelRef.current?.value) {
                handleCreateItem(labelRef.current.value);
                labelRef.current.value = "";
              }
            }}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <BiPlus className="text-xl" />
            Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {listData.items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            No items yet. Add your first todo!
          </div>
        ) : (
          listData.items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCheckToggle(item.id, !item.checked)}
              className={`group flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                item.checked
                  ? "bg-green-50 hover:bg-green-100"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 flex items-center justify-center rounded border-2 transition-colors duration-200 ${
                    item.checked
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 group-hover:border-gray-400"
                  }`}
                >
                  {item.checked && "✓"}
                </div>
                <span
                  className={`font-medium transition-all duration-200 ${
                    item.checked
                      ? "text-green-700 line-through"
                      : "text-gray-700"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              <button
                onClick={(evt) => {
                  evt.stopPropagation();
                  handleDeleteItem(item.id);
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

export default ToDoList;
