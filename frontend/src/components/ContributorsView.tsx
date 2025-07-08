
import React, { useState } from 'react';

// Dummy data for contributors
const initialContributors = [
  { id: 1, name: 'Jane Doe', email: 'jane@example.com', role: 'Frontend Developer' },
  { id: 2, name: 'John Smith', email: 'john@example.com', role: 'Backend Developer' },
];

interface Contributor {
  id: number;
  name: string;
  email: string;
  role: string;
}

function ContributorsView() {
  const [contributors, setContributors] = useState<Contributor[]>(initialContributors);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const addContributor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) return;
    setContributors([
      ...contributors,
      { id: Date.now(), name, email, role },
    ]);
    setName('');
    setEmail('');
    setRole('');
  };

  const removeContributor = (id: number) => {
    setContributors(contributors.filter(c => c.id !== id));
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-2">Contributors</h3>
      <p className="text-gray-500 mb-4">Manage project contributors here.</p>
      <form onSubmit={addContributor} className="flex gap-2 mb-4 flex-wrap items-end">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={e => setRole(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
      </form>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border">Name</th>
            <th className="py-2 px-4 border">Email</th>
            <th className="py-2 px-4 border">Role</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contributors.map(c => (
            <tr key={c.id}>
              <td className="py-2 px-4 border">{c.name}</td>
              <td className="py-2 px-4 border">{c.email}</td>
              <td className="py-2 px-4 border">{c.role}</td>
              <td className="py-2 px-4 border">
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => removeContributor(c.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {contributors.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-gray-400 py-4">No contributors yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ContributorsView;
