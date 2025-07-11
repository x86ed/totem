import React, { useState } from 'react'

// Dummy data for collaborators
const initialCollaborators = [
  { id: 1, name: 'Mona Lisa Octocat', email: 'octocat@github.com', role: 'Owner' },
  { id: 2, name: 'Clippy Assistant', email: 'clippy@microsoft.com', role: 'Editor' },
]

function CollaboratorsView() {
  const [collaborators, setCollaborators] = useState(initialCollaborators)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('Viewer')
  const [error, setError] = useState<string | null>(null)

  const addCollaborator = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!newName.trim() || !newEmail.trim()) {
      setError('Name and email are required')
      return
    }
    setCollaborators([
      ...collaborators,
      { id: Date.now(), name: newName.trim(), email: newEmail.trim(), role: newRole }
    ])
    setNewName('')
    setNewEmail('')
    setNewRole('Viewer')
  }

  const removeCollaborator = (id: number) => {
    setCollaborators(collaborators.filter(c => c.id !== id))
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Collaborators</h3>
      <p className="text-gray-500 mb-4">Manage project collaborators here.</p>
      <form onSubmit={addCollaborator} className="flex gap-2 mb-4 flex-wrap items-end">
        <input
          className="border rounded px-2 py-1"
          type="text"
          placeholder="Name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          type="email"
          placeholder="Email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
        />
        <select
          className="border rounded px-2 py-1"
          value={newRole}
          onChange={e => setNewRole(e.target.value)}
        >
          <option value="Owner">Owner</option>
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>
        <button className="bg-green-600 text-white px-3 py-1 rounded font-semibold" type="submit">Add</button>
        {error && <span className="text-red-500 text-sm ml-2">{error}</span>}
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 border-b text-left">Name</th>
              <th className="py-2 px-3 border-b text-left">Email</th>
              <th className="py-2 px-3 border-b text-left">Role</th>
              <th className="py-2 px-3 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {collaborators.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 border-b">{c.name}</td>
                <td className="py-2 px-3 border-b">{c.email}</td>
                <td className="py-2 px-3 border-b">{c.role}</td>
                <td className="py-2 px-3 border-b text-right">
                  <button
                    className="text-red-500 hover:underline text-xs"
                    onClick={() => removeCollaborator(c.id)}
                  >Remove</button>
                </td>
              </tr>
            ))}
            {collaborators.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-4">No collaborators yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CollaboratorsView
