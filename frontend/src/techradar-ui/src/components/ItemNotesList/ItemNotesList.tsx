import React, { useEffect, useState } from "react";
import * as api from "../../api/Data";
import { callDataApi } from "../../utils/ApiFunctions";

export const NoteRow = (note: api.RadarItemNote) => (
  <div>
    <div className="row justify-content-between bg-primary text-light">
      <div className="col-4">{note.userId}</div>
      <div className="col-4">{note.dateCreated}</div>
    </div>
    <div className="row">
      <div className="col-md-auto">{note.notes}</div>
    </div>
  </div>
);

interface ItemNotesProperties {
  radarItemId: number;
}

export const ItemNotesList: React.FunctionComponent<ItemNotesProperties> = (
  props: ItemNotesProperties,
): React.JSX.Element => {
  const [notes, setNotes] = useState<api.RadarItemNote[]>();

  useEffect(() => {
    callDataApi((baseUrl) => api.ItemApiFactory(undefined, baseUrl).itemIdNoteGet(props.radarItemId, 1, 10)).then(
      (notesResult) => setNotes(notesResult.data),
    );
  }, [props.radarItemId]);

  return (
    <div>
      <h3>Notes</h3>
      <div className="container-fluid legend">{notes?.map((x) => <NoteRow key={x.id} {...x} />)}</div>
    </div>
  );
};

export default ItemNotesList;
