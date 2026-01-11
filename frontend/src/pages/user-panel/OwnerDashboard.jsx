import { useState, useEffect } from "react";
import axios from "axios";
import { Card, Loading, Alert, Button } from "../../components/common/UIComponents";

export default function OwnerDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications/owner`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (err) {
      setError("Failed to fetch applications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
      try {
          await axios.put(`${API_BASE_URL}/applications/${id}/status`, { status }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          // Optimistic update
          setApplications(prev => prev.map(app => 
              app._id === id ? { ...app, status } : app
          ));
      } catch (err) {
          alert("Failed to update status");
      }
  }

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Owner Dashboard - Received Applications</h1>
      {error && <Alert type="error" message={error} />}

      {applications.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">No applications received yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <Card key={app._id} className="p-4">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{app.roomId?.name || "Unknown Room"}</h3>
                  <p className="text-gray-600">Applicant: {app.userName} ({app.userEmail})</p>
                  <p className="text-sm text-gray-500">Phone: {app.userPhone}</p>
                  <p className="text-sm text-gray-500">Duration: {app.duration} | People: {app.people}</p>
                   <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                      <p>Address: {app.address?.street}, {app.address?.district}, {app.address?.state}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 items-end">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                  }`}>
                    {app.status.toUpperCase()}
                  </span>
                  
                  {app.status === 'pending' && (
                      <div className="flex gap-2 mt-2">
                          <Button 
                            onClick={() => handleStatusUpdate(app._id, 'accepted')}
                            className="bg-green-600 hover:bg-green-700 text-sm py-1"
                          >
                              Accept
                          </Button>
                          <Button 
                            onClick={() => handleStatusUpdate(app._id, 'rejected')}
                            className="bg-red-600 hover:bg-red-700 text-sm py-1"
                          >
                              Reject
                          </Button>
                      </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
