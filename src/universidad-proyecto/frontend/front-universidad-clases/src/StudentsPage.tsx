import {useState} from "react";
import StudentList from "./component/students/StudentList";
import StudentDetail from "./component/students/StudentDetail";

export default function StudentsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="students-page" style={{display: 'flex', gap: 16}}>
      <aside style={{width: 340}}>
        <StudentList onSelect={setSelectedId} selectedId={selectedId} />
      </aside>
      <main style={{flex: 1}}>
        <StudentDetail estudianteId={selectedId} />
      </main>
    </div>
  );
}


