import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAddOns } from '../api/addOns';
import AddOnListItem from '../components/AddOnListItem';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function NewAddOns() {
  const { user } = useContext(AuthContext);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAddOns()
      .then(res => {
        const all = res.data || res;
        const myNew = all.filter(a => {
          const isMine =
            a.assigned_food_tech?._id === user?.id ||
            a.assigned_food_tech === user?.id ||
            a.assigned_food_techs?.some(ft => ft._id === user?.id);
          const isNew = a.status === 'inspection_assigned';
          return isMine && isNew;
        });
        setApps(myNew);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState />;
  if (apps.length === 0) return <EmptyState message="No new ad-on applications assigned to you." />;

  return (
    <div>
      <p className="section-heading">{apps.length} pending</p>
      {apps.map(a => <AddOnListItem key={a._id} app={a} />)}
    </div>
  );
}