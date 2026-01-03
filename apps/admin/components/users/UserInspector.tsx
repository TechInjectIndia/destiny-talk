'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { isConfigured, FirebaseUserRepository } from '@destiny-ai/database';
import { UserProfile } from '@destiny-ai/core';
import { Button } from '@destiny-ai/ui';

const userRepo = new FirebaseUserRepository();

export const UserInspector = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  useEffect(() => {
    if (!isConfigured) return;
    const fetchUsers = async () => {
      const data = await userRepo.listUsers(20);
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse mt-2.5">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">DOB</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} className="border-b border-gray-300">
                <td className="p-2">{u.displayName}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  {u.dobDay}/{u.dobMonth}/{u.dobYear}
                </td>
                <td className="p-2">
                  <Button
                    variant="secondary"
                    className="text-xs px-2 py-1 w-auto"
                    onClick={() => toast(`Viewing detailed logs for ${u.uid} (Coming Phase 3)`)}
                  >
                    Inspect
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

