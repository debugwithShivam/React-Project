import { useState } from "react";
import Header from "../page/Notes/Header";
import NotesContainer from "../page/Notes/NotesContainer";
export default function Notes() {

  const [search, setSearch] = useState("");

  return (
   <>
   <Header search={search} onSearchChange={setSearch}/>
   <NotesContainer search={search}/>
   </>
  );
}
