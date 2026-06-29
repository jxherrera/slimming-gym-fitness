
import { useState, useEffect } from 'react';

const CoachPanel = () => {

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [routineGoal, setRoutineGoal] = useState('');
    
    const [exercises, setExercises] = useState([
        { name: '', sets: '', reps: '', weight: '' }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const coachId = 2; 

    const fetchClients = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/routines/coach/${coachId}/clients`);
            if (!response.ok) throw new Error('Error de conexión');
            const data = await response.json();
            if (data.success) setClients(data.clients);
            else setError(data.message);
        } catch (err) {
            console.error("Error al cargar alumnos:", err); // SOLUCIÓN ESLINT
            setError("No se pudo cargar la lista de alumnos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    // Funciones del Modal
    const openModal = (client) => {
        setSelectedClient(client);
        setRoutineGoal(client.Goal || '');
        setExercises([{ name: '', sets: '', reps: '', weight: '' }]); // Resetear ejercicios
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    // Manejo dinámico de campos de ejercicios
    const handleExerciseChange = (index, field, value) => {
        const newExercises = [...exercises];
        newExercises[index][field] = value;
        setExercises(newExercises);
    };

    const addExerciseRow = () => {
        setExercises([...exercises, { name: '', sets: '', reps: '', weight: '' }]);
    };

    const removeExerciseRow = (index) => {
        const newExercises = exercises.filter((_, i) => i !== index);
        setExercises(newExercises);
    };

    const handleAssignRoutine = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            userId: selectedClient.UserID,
            coachId: coachId,
            goal: routineGoal,
            exercises: exercises 
        };

        try {
            const response = await fetch('http://localhost:3000/api/routines/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success) {
                alert('Rutina asignada exitosamente.');
                closeModal();
                fetchClients(); 
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al asignar rutina:", error); 
            alert("Error al guardar la rutina.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="text-center p-6 text-red-500 font-semibold">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
            {/* Dashboard Header Premium */}
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Mi Panel</h1>
                    <p className="text-gray-500 mt-1 text-sm">Gestiona tus alumnos y rutinas</p>
                </div>
                <div className="text-right">
                    <span className="text-sm text-gray-400 block">Alumnos Activos</span>
                    <span className="text-2xl font-bold text-blue-600">{clients.length}</span>
                </div>
            </div>

            {/* Tabla de Alumnos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Alumno</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Objetivo</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Gestión</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {clients.map((client) => (
                            <tr key={client.UserID} className="hover:bg-blue-50/50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.Email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Activo
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.Goal || 'No definido'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button 
                                        onClick={() => openModal(client)}
                                        className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all"
                                    >
                                        Diseñar Rutina
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL AVANZADO DE RUTINAS */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto pt-10 pb-10">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Constructor de Rutinas</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors">
                                ✖
                            </button>
                        </div>
                        
                        <form onSubmit={handleAssignRoutine}>
                            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                                <label className="block text-sm font-semibold text-blue-900 mb-2">Objetivo del Mes</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full border-0 bg-white rounded-md px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Ej. Hipertrofia Tren Superior"
                                    value={routineGoal}
                                    onChange={(e) => setRoutineGoal(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4 mb-6">
                                <h4 className="text-md font-bold text-gray-700">Ejercicios</h4>
                                {exercises.map((exercise, index) => (
                                    <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <input 
                                            type="text" placeholder="Nombre Ejercicio" required
                                            className="flex-1 rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            value={exercise.name} onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                                        />
                                        <input 
                                            type="number" placeholder="Series" required min="1"
                                            className="w-20 rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm"
                                            value={exercise.sets} onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                                        />
                                        <input 
                                            type="number" placeholder="Reps" required min="1"
                                            className="w-20 rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm"
                                            value={exercise.reps} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                                        />
                                        <input 
                                            type="number" placeholder="Peso (Lbs)" step="0.5"
                                            className="w-24 rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm"
                                            value={exercise.weight} onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                                        />
                                        {exercises.length > 1 && (
                                            <button type="button" onClick={() => removeExerciseRow(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-md">
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    onClick={addExerciseRow}
                                    className="mt-2 text-sm text-blue-600 font-semibold hover:text-blue-800"
                                >
                                    + Agregar otro ejercicio
                                </button>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold shadow-md transition disabled:opacity-50">
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