import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAddOns } from '../api/addOns';
import AddOnListItem from '../components/AddOnListItem';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function ManageAddOns() {
  const { user } = useContext(AuthContext);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAddOns()
      .then(res => {
        const all = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const userId = String(user?.id || user?._id || '');
        const userEmail = user?.email?.toLowerCase();

        const mine = all.filter(a => {
          const mainFtId = String(a.assigned_food_tech?._id || a.assigned_food_tech?.id || a.assigned_food_tech || '');
          const mainFtEmail = a.assigned_food_tech?.email?.toLowerCase();
          const matchesMain = (userId && mainFtId === userId) || (userEmail && mainFtEmail && mainFtEmail === userEmail);

          const matchesArray = Array.isArray(a.assigned_food_techs) && a.assigned_food_techs.some(ft => {
            const ftId = String(ft?._id || ft?.id || ft || '');
            const ftEmail = ft?.email?.toLowerCase();
            return (userId && ftId === userId) || (userEmail && ftEmail && ftEmail === userEmail);
          });

          return matchesMain || matchesArray || (!a.assigned_food_tech && (!a.assigned_food_techs || a.assigned_food_techs.length === 0));
        });
        setApps(mine);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState />;
  if (apps.length === 0) return <EmptyState message="No ad-on applications found for your account." />;

  return (
    <div>
      <p className="section-heading">{apps.length} total</p>
      {apps.map(a => <AddOnListItem key={a._id} app={a} />)}
    </div>
  );
}