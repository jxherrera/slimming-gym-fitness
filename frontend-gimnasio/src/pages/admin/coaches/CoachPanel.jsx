import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import RoutineManager from './RoutineManager';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CoachPanel = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const modeParam = searchParams.get('mode');
    const validTabs = ['alumnos', 'agenda', 'rutinas'];

    const [activeTab, setActiveTab] = useState(validTabs.includes(modeParam) ? modeParam : 'alumnos');

    useEffect(() => {
        if (modeParam && validTabs.includes(modeParam)) {
            if (activeTab !== modeParam) {
                setActiveTab(modeParam);
            }
        }
    }, [modeParam]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchParams({ mode: tabId });
    };
    const [clientTab, setClientTab] = useState('asignados');
    const [clients, setClients] = useState([]);
    const [unassignedClients, setUnassignedClients] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [routineGoal, setRoutineGoal] = useState('');
    const [exercises, setExercises] = useState([{ name: '', sets: '', reps: '', weight: '' }]);
    const [isSubmittingRoutine, setIsSubmittingRoutine] = useState(false);
    const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
    const [evalHistory, setEvalHistory] = useState([]);
    const [isSubmittingEval, setIsSubmittingEval] = useState(false);
    const [evalForm, setEvalForm] = useState({
        weightKg: '', bodyFatPercentage: '', chestPerimeter: '', waistPerimeter: '', notes: ''
    });
    
    // For template loading
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const coachId = 2; 

    const fetchData = async () => {
        try {
            setLoading(true);
            const [clientsRes, unassignedRes, scheduleRes, templatesRes] = await Promise.all([
                fetch(`${API_BASE}/routines/coach/${coachId}/clients`),
                fetch(`${API_BASE}/coaches/unassigned-members`),
                fetch(`${API_BASE}/routines/coach/${coachId}/schedule`),
                fetch(`${API_BASE}/routines/templates/coach/${coachId}`)
            ]);
            if (!clientsRes.ok || !unassignedRes.ok || !scheduleRes.ok) throw new Error('Error de conexión');
            
            const clientsData = await clientsRes.json();
            const unassignedData = await unassignedRes.json();
            const scheduleData = await scheduleRes.json();
            const templatesData = templatesRes.ok ? await templatesRes.json() : { success: false };

            if (clientsData.success) setClients(clientsData.clients);
            if (unassignedData.success) setUnassignedClients(unassignedData.members);
            if (scheduleData.success) setSchedule(scheduleData.schedule);
            if (templatesData.success) setTemplates(templatesData.templates);
        } catch (err) {
            console.error("Error al cargar datos del panel:", err);
            setError("No se pudo cargar la información del panel.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openRoutineModal = (client) => {
        setSelectedClient(client);
        setRoutineGoal(client.Goal || '');
        setExercises([{ name: '', sets: '', reps: '', weight: '', day: 'Lunes' }]);
        setSelectedTemplate('');
        setIsRoutineModalOpen(true);
    };

    const closeRoutineModal = () => {
        setIsRoutineModalOpen(false);
        setSelectedClient(null);
    };

    const handleExerciseChange = (index, field, value) => {
        const newExercises = [...exercises];
        newExercises[index][field] = value;
        setExercises(newExercises);
    };

    const handleTemplateSelect = (e) => {
        const templateId = e.target.value;
        setSelectedTemplate(templateId);
        
        if (templateId) {
            const template = templates.find(t => t.TemplateID == templateId);
            if (template) {
                setRoutineGoal(template.Goal || '');
                if (template.exercises && template.exercises.length > 0) {
                    setExercises(template.exercises.map(ex => ({
                        name: ex.name,
                        sets: ex.sets,
                        reps: ex.reps,
                        weight: ex.weight || '',
                        day: ex.day || 'Lunes'
                    })));
                } else {
                    setExercises([{ name: '', sets: '', reps: '', weight: '', day: 'Lunes' }]);
                }
            }
        }
    };

    const addExerciseRow = () => setExercises([...exercises, { name: '', sets: '', reps: '', weight: '', day: 'Lunes' }]);
    const removeExerciseRow = (index) => setExercises(exercises.filter((_, i) => i !== index));

    const handleAssignRoutine = async (e) => {
        e.preventDefault();
        setIsSubmittingRoutine(true);
        const payload = { userId: selectedClient.UserID, coachId, goal: routineGoal, exercises };
        try {
            const response = await fetch(`${API_BASE}/routines/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                alert('Rutina asignada exitosamente.');
                closeRoutineModal();
                fetchData();
            } else alert(`Error: ${data.message}`);
        } catch (error) {
            console.error("Error al asignar rutina:", error);
            alert("Error al guardar la rutina.");
        } finally {
            setIsSubmittingRoutine(false);
        }
    };

    const handleAssignMe = async (memberId) => {
        if (!window.confirm("¿Confirmas que deseas asignar este alumno a tu cargo?")) return;
        try {
            const response = await fetch(`${API_BASE}/coaches/${coachId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ MemberID: memberId })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Alumno asignado correctamente.');
                fetchData(); // Reload both lists
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error asignando alumno:", error);
            alert("Error de conexión al asignar alumno.");
        }
    };

    const handleRemoveClient = async (memberId) => {
        if (!window.confirm("¿Estás seguro de que deseas quitar a este alumno de tu lista?")) return;
        try {
            const response = await fetch(`${API_BASE}/coaches/assign/${memberId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (response.ok) {
                alert('Alumno removido correctamente.');
                fetchData();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error removiendo alumno:", error);
            alert("Error de conexión al remover alumno.");
        }
    };

    const fetchEvalHistory = async (userId) => {
        try {
            const response = await fetch(`${API_BASE}/evaluations/user/${userId}`);
            const data = await response.json();
            if (data.success) setEvalHistory(data.history);
        } catch (error) {
            console.error("Error cargando historial:", error);
        }
    };

    const openEvalModal = (client) => {
        setSelectedClient(client);
        setEvalForm({ weightKg: '', bodyFatPercentage: '', chestPerimeter: '', waistPerimeter: '', notes: '' });
        setEvalHistory([]); 
        fetchEvalHistory(client.UserID); 
        setIsEvalModalOpen(true);
    };

    const closeEvalModal = () => {
        setIsEvalModalOpen(false);
        setSelectedClient(null);
    };

    const handleEvalSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingEval(true);
        const payload = { ...evalForm, userId: selectedClient.UserID, coachId };
        
        try {
            const response = await fetch(`${API_BASE}/evaluations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                alert('Evaluación guardada exitosamente.');
                setEvalForm({ weightKg: '', bodyFatPercentage: '', chestPerimeter: '', waistPerimeter: '', notes: '' });
                fetchEvalHistory(selectedClient.UserID); 
            } else alert(`Error: ${data.message}`);
        } catch (error) {
            console.error("Error guardando evaluación:", error);
            alert("Error al conectar con el servidor.");
        } finally {
            setIsSubmittingEval(false);
        }
    };

    const formatTime = (timeString) => timeString ? new Date(timeString).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }) : '';
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-EC');

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="text-center p-6 text-red-500 font-semibold">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Mi Panel</h1>
                    <p className="text-gray-500 mt-1 text-sm">Gestiona tus alumnos y tu horario de clases</p>
                </div>
            </div>

            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => handleTabChange('alumnos')} className={`py-3 px-6 font-semibold text-sm transition-colors ${activeTab === 'alumnos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Mis Alumnos Asignados
                </button>
                <button onClick={() => handleTabChange('agenda')} className={`py-3 px-6 font-semibold text-sm transition-colors ${activeTab === 'agenda' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Mi Agenda Semanal
                </button>
                <button onClick={() => handleTabChange('rutinas')} className={`py-3 px-6 font-semibold text-sm transition-colors ${activeTab === 'rutinas' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Gestor de Rutinas
                </button>
            </div>
            
            {activeTab === 'rutinas' && (
                <div className="fade-in">
                    <RoutineManager coachId={coachId} />
                </div>
            )}
            
            {activeTab === 'alumnos' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden fade-in">
                    
                    <div className="flex border-b border-gray-100 bg-gray-50/50 px-6 pt-4">
                        <button onClick={() => setClientTab('asignados')} className={`pb-3 px-4 text-sm font-bold transition-all ${clientTab === 'asignados' ? 'border-b-2 border-emerald-500 text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}>
                            Mis Alumnos ({clients.length})
                        </button>
                        <button onClick={() => setClientTab('disponibles')} className={`pb-3 px-4 text-sm font-bold transition-all ${clientTab === 'disponibles' ? 'border-b-2 border-emerald-500 text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}>
                            Nuevos Alumnos Disponibles ({unassignedClients.length})
                        </button>
                    </div>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Alumno</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Objetivo</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {clientTab === 'asignados' ? (
                                clients.map((client) => (
                                    <tr key={client.UserID} className="hover:bg-blue-50/50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.Email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.Goal || 'No definido'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                            <button onClick={() => openRoutineModal(client)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-xs font-bold border border-blue-200 transition-all">
                                                🏋️ Rutina
                                            </button>
                                            <button onClick={() => openEvalModal(client)} className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg text-xs font-bold border border-emerald-200 transition-all">
                                                📏 Medidas
                                            </button>
                                            <button onClick={() => handleRemoveClient(client.UserID)} className="text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-xs font-bold border border-red-200 transition-all">
                                                🗑️ Quitar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                unassignedClients.length > 0 ? (
                                    unassignedClients.map((client) => (
                                        <tr key={client.UserID} className="hover:bg-orange-50/50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.FirstName} {client.LastName} <br/><span className="text-xs text-gray-400">{client.Email}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.Goal || 'No definido'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                                <button onClick={() => handleAssignMe(client.UserID)} className="text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-all">
                                                    👋 Reclutar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">
                                            Todos los alumnos activos tienen entrenador asignado en este momento.
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'agenda' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 fade-in">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Clases Grupales Programadas</h3>
                    {schedule.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">No tienes clases asignadas para esta semana.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {schedule.map((clase) => (
                                <div key={clase.ScheduleID} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-900 text-lg">{clase.ClassName}</h4>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">Aforo: {clase.Capacity}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p className="flex items-center gap-2">📅 <span className="font-semibold">{clase.DayOfWeek}</span></p>
                                        <p className="flex items-center gap-2">⏰ {formatTime(clase.StartTime)} - {formatTime(clase.EndTime)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {isRoutineModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto pt-10 pb-10">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Constructor de Rutinas</h3>
                            <button onClick={closeRoutineModal} className="text-gray-400 hover:text-red-500 transition-colors">✖</button>
                        </div>
                        <form onSubmit={handleAssignRoutine}>
                            <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Cargar desde Plantilla (Opcional)</label>
                                <select className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500" value={selectedTemplate} onChange={handleTemplateSelect}>
                                    <option value="">-- Seleccionar Plantilla --</option>
                                    {templates.map(tpl => (
                                        <option key={tpl.TemplateID} value={tpl.TemplateID}>{tpl.TemplateName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                                <label className="block text-sm font-semibold text-blue-900 mb-2">Objetivo del Mes</label>
                                <input type="text" required className="w-full border-0 bg-white rounded-md px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={routineGoal} onChange={(e) => setRoutineGoal(e.target.value)} />
                            </div>
                            <div className="space-y-4 mb-6">
                                {exercises.map((exercise, index) => (
                                    <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-200 flex-wrap md:flex-nowrap">
                                        <select className="w-full md:w-32 rounded-md border-gray-300 px-2 py-2 text-sm shadow-sm" value={exercise.day} onChange={(e) => handleExerciseChange(index, 'day', e.target.value)}>
                                            {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'].map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <input type="text" placeholder="Ejercicio" required className="flex-1 rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm" value={exercise.name} onChange={(e) => handleExerciseChange(index, 'name', e.target.value)} />
                                        <input type="number" placeholder="Series" required min="1" className="w-20 rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm" value={exercise.sets} onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)} />
                                        <input type="number" placeholder="Reps" required min="1" className="w-20 rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm" value={exercise.reps} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)} />
                                        <input type="number" placeholder="Peso" step="0.5" className="w-24 rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm" value={exercise.weight} onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)} />
                                        {exercises.length > 1 && (<button type="button" onClick={() => removeExerciseRow(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-md">🗑️</button>)}
                                    </div>
                                ))}
                                <button type="button" onClick={addExerciseRow} className="mt-2 text-sm text-blue-600 font-semibold">+ Agregar otro ejercicio</button>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeRoutineModal} className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold">Cancelar</button>
                                <button type="submit" disabled={isSubmittingRoutine} className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold shadow-md">{isSubmittingRoutine ? 'Guardando...' : 'Guardar Rutina'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isEvalModalOpen && (
                <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
                        
                        {/* Columna Izquierda: Formulario */}
                        <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-gray-100 bg-emerald-50/30">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Registrar Medidas</h3>
                                <button onClick={closeEvalModal} className="md:hidden text-gray-400 hover:text-red-500">✖</button>
                            </div>
                            <form onSubmit={handleEvalSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Peso (Kg) *</label>
                                    <input type="number" step="0.1" required className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                        value={evalForm.weightKg} onChange={(e) => setEvalForm({...evalForm, weightKg: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">% Grasa</label>
                                        <input type="number" step="0.1" className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                            value={evalForm.bodyFatPercentage} onChange={(e) => setEvalForm({...evalForm, bodyFatPercentage: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Pecho (cm)</label>
                                        <input type="number" step="0.1" className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                            value={evalForm.chestPerimeter} onChange={(e) => setEvalForm({...evalForm, chestPerimeter: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cintura (cm)</label>
                                    <input type="number" step="0.1" className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                        value={evalForm.waistPerimeter} onChange={(e) => setEvalForm({...evalForm, waistPerimeter: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Notas / Observaciones</label>
                                    <textarea className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm" rows="2"
                                        value={evalForm.notes} onChange={(e) => setEvalForm({...evalForm, notes: e.target.value})} />
                                </div>
                                <button type="submit" disabled={isSubmittingEval} className="w-full mt-4 bg-emerald-600 text-white py-2 rounded-lg font-bold shadow-md hover:bg-emerald-700 transition">
                                    {isSubmittingEval ? 'Guardando...' : 'Guardar Evaluación'}
                                </button>
                            </form>
                        </div>

                        <div className="w-full md:w-1/2 p-8 bg-white relative">
                            <button onClick={closeEvalModal} className="hidden md:block absolute top-6 right-6 text-gray-400 hover:text-red-500 text-xl">✖</button>
                            
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Historial de Progreso</h3>
                            {evalHistory.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No hay evaluaciones registradas para este alumno.</p>
                            ) : (
                                <div className="space-y-4">
                                    {evalHistory.map((ev, idx) => (
                                        <div key={ev.EvaluationID} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-2">
                                                <span className="font-bold text-gray-700">Fecha: {formatDate(ev.EvaluationDate)}</span>
                                                {idx === 0 && <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-bold">Más reciente</span>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                                                <p>⚖️ Peso: <span className="font-semibold text-gray-900">{ev.WeightKg} kg</span></p>
                                                <p>📉 Grasa: <span className="font-semibold text-gray-900">{ev.BodyFatPercentage || '--'}%</span></p>
                                                <p>👕 Pecho: <span className="font-semibold text-gray-900">{ev.ChestPerimeter || '--'} cm</span></p>
                                                <p>👖 Cintura: <span className="font-semibold text-gray-900">{ev.WaistPerimeter || '--'} cm</span></p>
                                            </div>
                                            {ev.Notes && <p className="text-xs text-gray-500 mt-3 italic bg-white p-2 rounded border border-gray-100">"{ev.Notes}"</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachPanel;