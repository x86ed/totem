import React, { useState } from 'react'

// Dummy data for personas
const initialPersonas = [
  { id: 1, name: 'Product Manager', description: 'Defines requirements and priorities.' },
  { id: 2, name: 'QA Engineer', description: 'Ensures product quality and testing.' },
]

function PersonasView() {
  const [personas, setPersonas] = useState(initialPersonas)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const addPersona = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!newName.trim() || !newDescription.trim()) {
      setError('Name and description are required')
      return
    }
    setPersonas([
      ...personas,
      { id: Date.now(), name: newName.trim(), description: newDescription.trim() }
    ])
    setNewName('')
    setNewDescription('')
  }

  const removePersona = (id: number) => {
    setPersonas(personas.filter(p => p.id !== id))
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Personas</h3>
      <p className="text-gray-500 mb-4">Define and manage project personas here.</p>
      <form onSubmit={addPersona} className="flex gap-2 mb-4 flex-wrap items-end">
        <input
          className="border rounded px-2 py-1"
          type="text"
          placeholder="Persona Name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          type="text"
          placeholder="Description"
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
        />
        <button className="bg-green-600 text-white px-3 py-1 rounded font-semibold" type="submit">Add</button>
        {error && <span className="text-red-500 text-sm ml-2">{error}</span>}
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 border-b text-left">Name</th>
              <th className="py-2 px-3 border-b text-left">Description</th>
              <th className="py-2 px-3 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {personas.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 border-b">{p.name}</td>
                <td className="py-2 px-3 border-b">{p.description}</td>
                <td className="py-2 px-3 border-b text-right">
                  <button
                    className="text-red-500 hover:underline text-xs"
                    onClick={() => removePersona(p.id)}
                  >Remove</button>
                </td>
              </tr>
            ))}
            {personas.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-gray-400 py-4">No personas yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PersonasView
