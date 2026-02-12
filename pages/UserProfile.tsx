import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export const UserProfile = () => {
  const { session, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.user.name || '');

  if (!session) return <div>Please log in</div>;

  const handleUpdate = async () => {
    await updateProfile(name);
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application role.</p>
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        Edit Profile
                    </button>
                )}
            </div>
            <div className="border-t border-gray-200">
                <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <User className="w-4 h-4"/> Full name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        className="border-gray-300 rounded-md shadow-sm border p-1 w-full"
                                    />
                                    <button onClick={handleUpdate} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs">Save</button>
                                    <button onClick={() => setIsEditing(false)} className="text-gray-500 px-2 text-xs">Cancel</button>
                                </div>
                            ) : (
                                session.user.name
                            )}
                        </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Mail className="w-4 h-4"/> Email address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{session.user.email}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Shield className="w-4 h-4"/> Role
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.user.role === 'BRAND' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                {session.user.role}
                            </span>
                        </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4"/> Member since
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {new Date(session.user.createdAt).toLocaleDateString()}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    </div>
  );
};