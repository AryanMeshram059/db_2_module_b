import { useEffect, useState } from "react";
import API from "../api";

function Requests({ role }) {
  const [requests, setRequests] = useState([]);

  const load = () => {
    API.get("/request").then(res => setRequests(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id, status) => {
    await API.put(`/request/${id}`, { status });

    // 🔥 update UI without reload
    setRequests(prev =>
      prev.map(r =>
        r.RequestID === id ? { ...r, Status: status } : r
      )
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">

      <h3 className="text-xl font-semibold mb-3">Requests</h3>

      {requests.length === 0 && <p>No requests</p>}

      {requests.map(r => (
        <div key={r.RequestID} className="border p-3 mb-2 rounded">

          <p><b>Reason:</b> {r.Reason}</p>
          <p>
            <b>Status:</b>{" "}
            <span className={
              r.Status === "Approved" ? "text-green-600" :
              r.Status === "Rejected" ? "text-red-500" :
              "text-yellow-500"
            }>
              {r.Status}
            </span>
          </p>

          {/* ADMIN ONLY */}
          {role === "Admin" && r.Status === "Pending" && (
            <div className="mt-2">
              <button
                onClick={() => update(r.RequestID, "Approved")}
                className="bg-green-500 text-white px-3 py-1 mr-2 rounded"
              >
                Approve
              </button>

              <button
                onClick={() => update(r.RequestID, "Rejected")}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          )}

        </div>
      ))}

    </div>
  );
}

export default Requests;