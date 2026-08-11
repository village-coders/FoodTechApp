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
        const all = res.data || res;
        const mine = all.filter(a =>
          a.assigned_food_tech?._id === user?.id ||
          a.assigned_food_tech === user?.id ||
          a.assigned_food_techs?.some(ft => ft._id === user?.id)
        );
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