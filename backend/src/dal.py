from bson import ObjectId #ObjectId is used to represent MongoDB's unique identifiers 
from motor.motor_asyncio import AsyncIOMotorCollection #allows asynchronous database operations with MONGODB
from pymongo import ReturnDocument #it helps MONGODB commands return updated documents 

from pydantic import BaseModel # BaseModel is from Pydantic, a FastAPI dependency that validates request and response data similar to TypeScript interfaces

from uuid import uuid4 # uuid4() generates unique IDs, similar to UUID.v4() in JavaScript


#  Pydantic Models

# These are similar to TypeScript interfaces or Mongoose schemas describing the data structure for your app

# ListSummary, ToDoListItem and ToDoList classes

# Each class here represents a different view of a to-do list
# ListSummary only includes a few key fields
# ToDoListItem models individual items on a list
# ToDoList combines all items and their properties
# Each class has a static method from_doc which converts MongoDB documents into the respective class. This is helpful for mapping MongoDB data into the structures your FastAPI endpoints will use

class ListSummary(BaseModel):
    id: str
    name: str
    item_count: int
    
    @staticmethod
    def from_doc(doc) -> "ListSummary":
        return ListSummary(
            id= str(doc("_id")),
            name=doc("name"),
            item_count=doc("item_count"),
        )
        
class ToDoListItem(BaseModel):
    id: str
    label: str
    checked: bool
    
    @staticmethod
    def from_doc(item) -> "ToDoListItem":
        return ToDoListItem(
            id=item["id"],
            label=item["label"],
            checked=item["checked"],
        )
        
class ToDoList(BaseModel):
    id: str
    name: str
    items: list[ToDoListItem]
    
    @staticmethod
    def from_doc(doc) -> "ToDoList":
        return ToDoList(
            id=str(doc["_id"]),
            name=doc["name"],
            items=[ToDoListItem.from_doc(item) for item in doc["items"]]
        )
        
# Data Access Layer (DAL)
# The ToDoDAL class handles all database interactions

class ToDoDAL:
    #The constructor initializes the ToDoDAL with a MongoDB collection for to-do lists. self._todo_collection is now an instance that can run database commands.
    
    def __init__(self, todo_collection: AsyncIOMotorCollection):
        self._todo_collection = todo_collection
        
# Methods in ToDoDAL

# list_todo_lists(): Asynchronously fetches all to-do lists, only showing basic fields like name and item_count.

    async def list_todo_lists(self, session=None):
        async for doc in self._todo_collection.find(
            {},
            projection={
                "name": 1,
                "item_count": {"size", "$items"},
            },
            sort={"name": 1},
            session=session,
        ):
            yield ListSummary.from_doc(doc)

# create_todo_list(name): Inserts a new list document into MongoDB and returns the new list’s ID.
            
    async def create_todo_list(self , name: str, session = None) -> str:
        response = await self._todo_collection.insert_one(
            {"name": name, "items":[]},
            session=session,
        )
        return str(response.inserted_id)
    
# get_todo_list(id): Fetches a specific list based on id.

    async def get_todo_list(self , id: str | ObjectId, session=None) -> ToDoList:
        doc = await self._todo_collection.find_one(
            {"_id": ObjectId(id)},
            session=session
        )
        return ToDoList.from_doc(doc)
    
# delete_todo_list(id): Deletes a list by its id, returning True if the deletion was successful.

    async def delete_todo_list(self, id: str | ObjectId, session= None) -> bool:
        response = await self._todo_collection.delete_one(
            {"_id": ObjectId(id)},
            session=session,
        )
        return response.deleted_count == 1

# create_item(id, label): Adds an item to a specific to-do list, generating a unique ID for each item.
    
    async def create_item(
        self,
        id: str | ObjectId,
        label: str,
        session = None,
    ) -> ToDoList | None:
        result = await self._todo_collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {
                "$push":{
                    "items":{
                        "id": uuid4().hex,
                        "label": label,
                        "checked": False,
                    }
                }
            },
            session=session,
            return_document=ReturnDocument.AFTER,
        )
        if result:
            return ToDoList.from_doc(result)
        
# checked_state(doc_id, item_id, checked_state): Toggles an item’s checked status.
    
    async def checked_state(
        self,
        doc_id: str | ObjectId,
        item_id: str,
        checked_state: bool,
        session = None,
    )-> ToDoList | None:
        result  = await self._todo_collection.find_one_and_update(
            {"_id": ObjectId(doc_id), "items.id": item_id},
            {"$set": {"item.$.checked": checked_state}},
            session=session,
            return_document=ReturnDocument.AFTER,
        )
        if result:
            return ToDoList.from_doc(result)
        

# delete_item(doc_id, item_id): Removes an item by id
    
    async def delete_item(
        self,
        doc_id: str | ObjectId,
        item_id: str,
        session= None,
    )-> ToDoList | None :
        result = await self._todo_collection.find_one_and_update(
            {"_id":ObjectId(doc_id)},
            {"$pull": {"items": {"id": item_id}}},
            session=session,
            return_document=ReturnDocument.AFTER,
        )
        if result:
            return ToDoList.from_doc(result)