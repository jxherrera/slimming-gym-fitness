import { useState, useEffect } from 'react';

const CoachPanel = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [goalInput, setGoalInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const coachId = 2; 

    const fetchClients = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/routines/coach/${coachId}/clients`);
            if (!response.ok) throw new Error('Error al conectar con el servidor');
            
            const data = await response.json();
            if (data.success) {
                setClients(data.clients);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error("Error fetching clients:", err);
            setError("No se pudo cargar la lista de clientes.");
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchClients();
    }, [coachId]);

    const openModal = (client) => {
        setSelectedClient(client);
        setGoalInput(client.Goal || ''); 
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
        setGoalInput('');
    };

    const handleAssignRoutine = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:3000/api/routines/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: selectedClient.UserID,
                    coachId: coachId,
                    goal: goalInput
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('¡Rutina asignada exitosamente en la base de datos!');
                closeModal();
                fetchClients(); 
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error asignando rutina:", error);
            alert("Error al conectar con el servidor para asignar la rutina.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Cargando tus clientes...</div>;
    if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

    return (
        <div className="container mx-auto p-6 relative">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Panel del Entrenador</h1>
            <h2 className="text-lg mb-4">Mis Clientes Asignados</h2>

            {clients.length === 0 ? (
                <p className="text-gray-600">Aún no tienes clientes asignados.</p>
            ) : (
                <div className="overflow-x-auto shadow-sm rounded-lg">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">ID</th>
                                <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Email</th>
                                <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Estado</th>
                                <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Objetivo Actual</th>
                                <th className="py-2 px-4 border-b text-center text-sm font-semibold text-gray-600">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client.UserID} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b text-sm">{client.UserID}</td>
                                    <td className="py-2 px-4 border-b text-sm">{client.Email}</td>
                                    <td className="py-2 px-4 border-b text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            client.Status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {client.Status}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 border-b text-sm">{client.Goal || 'Sin definir'}</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <button 
                                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                                            onClick={() => openModal(client)}
                                        >
                                            Asignar / Editar Rutina
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL DE ASIGNACIÓN DE RUTINA */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2">
                            Definir Objetivo Deportivo
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Cliente: <span className="font-semibold">{selectedClient?.Email}</span>
                        </p>
                        
                        <form onSubmit={handleAssignRoutine}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Objetivo (Ej. Hipertrofia, Pérdida de Peso)
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                                    placeholder="Ingrese el objetivo de la rutina"
                                    value={goalInput}
                                    onChange={(e) => setGoalInput(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button 
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded transition flex items-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar Rutina'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachPanel;