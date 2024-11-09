import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import ListToDoLists from "./ListToDoLists";
import ToDoList from "./ToDoList";

function App() {
  const [listSummaries, setlistSummaries] = useState(null);
  const [selectedItem, setselectedItem] = useState(null);

  useEffect(() => {
    reloadData().catch(console.error);
  }, []);

  async function reloadData() {
    const response = await axios.get("/api/lists");
    const data = await response.data;
    setlistSummaries(data);
  }

  function handleNewToDoList(newName: any) {
    const updateData = async () => {
      const newListData = {
        name: newName,
      };

      await axios.post("/api/lists", newListData);
      reloadData().catch(console.error);
    };
    updateData();
  }

  function handleDeleteToDoList(id: any) {
    const updateData = async () => {
      await axios.delete(`/api/lists/${id}`);
      reloadData().catch(console.error);
    };
    updateData();
  }

  function handleSelectList(id: any) {
    console.log("Selecting item", id);
    setselectedItem(id);
  }

  function backToList() {
    setselectedItem(null);
    reloadData().catch(console.error);
  }

  if (selectedItem === null) {
    return (
      <div>
        <ListToDoLists
          listSummaries={listSummaries}
          handleSelectList={handleSelectList}
          handleNewToDoList={handleNewToDoList}
          handleDeleteToDoList={handleDeleteToDoList}
        />
      </div>
    );
  } else {
    return (
      <div>
        <ToDoList listId={selectedItem} handleBackButton={backToList} />
      </div>
    );
  }
}

export default App;
