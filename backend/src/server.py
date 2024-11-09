from contextlib import asynccontextmanager
from datetime import datetime
import os
import sys

from bson import ObjectId
from fastapi import FastAPI, status
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
import uvicorn

from dal import ToDoDAL, ListSummary, ToDoList

COLLECTION_NAME = "todo_lists"
MONGO_URI = os.environ["MONGODB_URI"]
DEBUG = os.environ.get("DEBUG","").strip().lower() in {"1", "true" ,"on", "yes" }

#This function ensures MongoDB is connected before starting the server.
# app.todo_dal = ToDoDAL(todo_lists) makes ToDoDAL accessible via app.todo_dal in your API routes.

@asynccontextmanager
async def lifespan(app: FastAPI):
    #startup:
    client = AsyncIOMotorClient(MONGO_URI)
    database = client.get_default_database()
    
    #ensure the database is available:
    pong = await database.command("ping")
    if int(pong["ok"]) != 1:
        raise Exception("Cluster connection is not okay!")
    
    todo_lists = database.get_collection(COLLECTION_NAME)
    app.todo_dal = ToDoDAL(todo_lists)
    
    #yield back to FastAPI Application:
    yield
    
    #shutdown:
    client.close()
    
# This creates the FastAPI instance, configuring it with a lifespan function that manages app startup and shutdown processes.
    
app = FastAPI(lifespan=lifespan, debug=DEBUG)



# Purpose: Lists all to-do lists.
# Return: Uses list_todo_lists() from ToDoDAL to fetch and yield summaries of each to-do list.
@app.get("/api/lists")
async def get_all_lists() -> list[ListSummary]:
    return [i async for i in app.todo_dal.list_todo_lists()]

class NewList(BaseModel):
    name: str

class NewListResponse(BaseModel):
    id:str
    name:str
    
# Purpose: Adds a new list by calling create_todo_list() from ToDoDAL.
# Data: Receives a NewList object with the name field, returning a NewListResponse.

@app.post("/api/lists", status_code=status.HTTP_201_CREATED)
async def create_todo_list(new_list: NewList) -> NewListResponse:
    return NewListResponse(
        id = await app.todo_dal.create_todo_list(new_list.name),
        name= new_list.name,
    )
    
# get_list: Fetches a specific to-do list.
@app.get("/api/lists/{list_id}")
async def get_list(list_id: str) -> ToDoList:
    """Get a single to-do list"""
    return await app.todo_dal.get_todo_list(list_id)

# delete_list: Deletes a to-do list.
@app.delete("/api/lists/{list_id}")
async def delete_list(list_id: str) -> bool:
    return await app.todo_dal.delete_todo_list(list_id)


class NewItem(BaseModel):
    label: str
    
class NewItemResponse(BaseModel):
    id: str
    label:str
    
@app.post("/api/lists/{list_id}/items/",
          status_code=status.HTTP_201_CREATED,
)

# create_item: Adds an item to a list.
async def create_item(list_id: str , new_item: NewItem) -> ToDoList:
    return await app.todo_dal.create_item(list_id, new_item.label)


# delete_item: Deletes a specific item from a list.
@app.delete("/api/lists/{list_id}/items/{item_id}")
async def delete_item(list_id: str, item_id: str) -> ToDoList:
    return await app.todo_dal.delete_item(list_id, item_id)

class ToDoItemUpdate(BaseModel):
    item_id: str
    checked_state: bool
    
# set_checked_state: Updates an item’s checked state (true/false).
@app.patch("/api/lists/{list_id}/checked_state")
async def set_checked_state(list_id: str, update: ToDoItemUpdate) -> ToDoList:
    return await app.todo_dal.set_checked_state(
        list_id, update.item_id, update.checked_state
    )
    
class DummyResponse(BaseModel):
    id: str
    when: datetime
    
@app.get("/api/dummy")
async def get_dummy() -> DummyResponse:
    return DummyResponse(
        id= str(ObjectId()),
        when= datetime.now()
    )

def main(argv=sys.argv[1:]):
    try:
        uvicorn.run("server:app", host="0.0.0.0" , port= 3001, reload= DEBUG)
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    main()