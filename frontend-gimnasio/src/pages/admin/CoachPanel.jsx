import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import './shared/admin-core.css';
import { useTheme } from '../../context/ThemeContext';
import { FaUser, FaDumbbell, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';

const CoachPanel = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const themeClass = isDarkMode ? 'theme-dark' : 'theme-light';
    const themeIcon = isDarkMode ? '☀️' : '🌙';

    const [clients, setClients] = useState([]);
    const [unassignedClients, setUnassignedClients] = useState([]);
    const [clientTab, setClientTab] = useState('asignados');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [routineGoal, setRoutineGoal] = useState('');
    
    const defaultDays = { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [], Sábado: [], Domingo: [] };
    const [exercisesByDay, setExercisesByDay] = useState(defaultDays);
    const [activeDay, setActiveDay] = useState('Lunes');
    const [uniqueExercises, setUniqueExercises] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuth();
    const coachId = user?.id || 2; 

    const fetchClients = async () => {
        try {
            const [clientsRes, unassignedRes] = await Promise.all([
                api.get(`/routines/coach/${coachId}/clients`),
                api.get('/coaches/unassigned-members')
            ]);
            
            if (clientsRes.data.success) {
                setClients(clientsRes.data.clients);
            } else {
                setError(clientsRes.data.message);
            }

            if (unassignedRes.data.success) {
                setUnassignedClients(unassignedRes.data.members);
            }
        } catch (err) {
            console.error("Error al cargar alumnos:", err);
            setError("No se pudo cargar la lista de alumnos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchUniqueExercises();
    }, []);

    const fetchUniqueExercises = async () => {
        try {
            const response = await api.get('/routines/exercises/unique');
            if (response.data.success) {
                setUniqueExercises(response.data.exercises);
            }
        } catch (error) {
            console.error("Error al cargar ejercicios únicos:", error);
        }
    };

    const handleAssignMe = async (memberId) => {
        if (!window.confirm("¿Confirmas que deseas asignar este alumno a tu cargo?")) return;
        try {
            const response = await api.post(`/coaches/${coachId}/assign`, { MemberID: memberId });
            if (response.data.success || response.status === 200) {
                alert('Alumno asignado correctamente.');
                fetchClients(); // Recargar listas
            } else {
                alert(`Error: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Error asignando alumno:", error);
            alert("Error de conexión al asignar alumno.");
        }
    };

    const handleRemoveClient = async (memberId) => {
        if (!window.confirm("¿Estás seguro de que deseas quitar a este alumno de tu lista?")) return;
        try {
            const response = await api.delete(`/coaches/assign/${memberId}`);
            if (response.data.success || response.status === 200) {
                alert('Alumno removido correctamente.');
                fetchClients();
            } else {
                alert(`Error: ${response.data.message || 'No se pudo remover al alumno'}`);
            }
        } catch (error) {
            console.error("Error removiendo alumno:", error);
            alert("Error de conexión al remover alumno.");
        }
    };

    // Funciones del Modal
    const openModal = async (client) => {
        setSelectedClient(client);
        setRoutineGoal(client.Goal || '');
        setExercisesByDay(defaultDays);
        setActiveDay('Lunes');
        setIsModalOpen(true);

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            const res = await fetch(`${apiBase}/routines/user/${client.UserID}/current`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.routine) {
                    setRoutineGoal(data.routine.Goal || '');
                    if (data.routine.exercises && data.routine.exercises.length > 0) {
                        const mapped = { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [], Sábado: [], Domingo: [] };
                        data.routine.exercises.forEach(ex => {
                            const day = ex.day || 'Lunes';
                            if (mapped[day]) {
                                mapped[day].push(ex);
                            }
                        });
                        setExercisesByDay(mapped);
                    }
                }
            }
        } catch (error) {
            console.error("Error obteniendo la rutina actual:", error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    // Manejo dinámico de campos de ejercicios
    const handleExerciseChange = (index, field, value) => {
        const newDay = [...exercisesByDay[activeDay]];
        newDay[index][field] = value;
        setExercisesByDay({ ...exercisesByDay, [activeDay]: newDay });
    };

    const addExerciseRow = () => {
        setExercisesByDay({
            ...exercisesByDay,
            [activeDay]: [...exercisesByDay[activeDay], { name: '', sets: '', reps: '', weight: '' }]
        });
    };

    const removeExerciseRow = (index) => {
        const newDay = exercisesByDay[activeDay].filter((_, i) => i !== index);
        setExercisesByDay({ ...exercisesByDay, [activeDay]: newDay });
    };

    const handleAssignRoutine = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const allExercises = [];
        Object.keys(exercisesByDay).forEach(day => {
            exercisesByDay[day].forEach(ex => {
                if (ex.name && ex.name.trim() !== '') {
                    allExercises.push({ ...ex, day });
                }
            });
        });

        const payload = {
            userId: selectedClient.UserID,
            coachId: coachId,
            goal: routineGoal,
            exercises: allExercises 
        };

        try {
            const response = await api.post('/routines/assign', payload);
            const data = response.data;
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

    if (loading) return (
        <div className={`admin-page ${themeClass}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div style={{ color: '#8b8593' }}>Cargando alumnos...</div>
        </div>
    );

    if (error) return (
        <div className={`admin-page ${themeClass}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px' }}>{error}</div>
        </div>
    );

    return (
        <div className={`admin-page ${themeClass} fade-in`} style={{ padding: '20px' }}>
            <div className="settings-main-card" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 className="settings-title" style={{ marginBottom: '10px' }}>Hola, {user?.name || user?.firstName || 'Coach'}</h2>
                        <p style={{ color: '#8b8593', marginBottom: '30px', fontSize: '15px' }}>Gestiona tus alumnos y asígnales rutinas.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#8b8593', textTransform: 'uppercase', letterSpacing: '1px' }}>Alumnos Activos</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{clients.length}</div>
                        </div>
                        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                            {themeIcon}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <button 
                        onClick={() => setClientTab('asignados')} 
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: clientTab === 'asignados' ? '#3b82f6' : 'transparent', color: clientTab === 'asignados' ? '#fff' : '#8b8593' }}
                    >
                        Mis Alumnos
                    </button>
                    <button 
                        onClick={() => setClientTab('disponibles')} 
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: clientTab === 'disponibles' ? '#10b981' : 'transparent', color: clientTab === 'disponibles' ? '#fff' : '#8b8593' }}
                    >
                        Nuevos Alumnos Disponibles
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {clientTab === 'asignados' ? (
                        clients.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#8b8593', background: '#f4f4f5', borderRadius: '16px' }} className="theme-dark-fix-bg">
                                No tienes alumnos asignados actualmente.
                            </div>
                        ) : (
                            clients.map(client => (
                                <div className="setting-row" key={client.UserID}>
                                    <div className="setting-icon">
                                        <FaUser />
                                    </div>
                                    <div className="setting-content">
                                        <div className="setting-title">{client.Email}</div>
                                        <div className="setting-desc">
                                            Estado: <span style={{ color: '#10b981', fontWeight: 'bold' }}>Activo</span> • 
                                            Objetivo: <strong style={{ color: '#0ea5e9', marginLeft: '4px' }}>{client.Goal || 'No definido'}</strong>
                                        </div>
                                    </div>
                                    <div className="setting-action" style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            type="button" 
                                            className="btn-pill-blue" 
                                            onClick={() => openModal(client)} 
                                            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <FaDumbbell /> Diseñar Rutina
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveClient(client.UserID)} 
                                            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            <FaTrash /> Quitar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        unassignedClients.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#8b8593', background: '#f4f4f5', borderRadius: '16px' }} className="theme-dark-fix-bg">
                                Todos los alumnos activos tienen entrenador asignado en este momento.
                            </div>
                        ) : (
                            unassignedClients.map(client => (
                                <div className="setting-row" key={client.UserID} style={{ borderLeft: '4px solid #10b981' }}>
                                    <div className="setting-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                                        <FaUser />
                                    </div>
                                    <div className="setting-content">
                                        <div className="setting-title">{client.FirstName} {client.LastName}</div>
                                        <div className="setting-desc">
                                            <span style={{ color: '#8b8593' }}>{client.Email}</span> • 
                                            Objetivo: <strong style={{ color: '#10b981', marginLeft: '4px' }}>{client.Goal || 'No definido'}</strong>
                                        </div>
                                    </div>
                                    <div className="setting-action">
                                        <button 
                                            type="button" 
                                            onClick={() => handleAssignMe(client.UserID)} 
                                            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            👋 Reclutar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop" role="dialog" aria-modal="true">
                    <div className="modal-card scale-in theme-dark-fix-bg theme-dark-fix-border" style={{ maxWidth: '650px', background: '#fff', borderRadius: '24px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }} className="theme-dark-fix-text">Constructor de Rutinas</h3>
                            <button type="button" onClick={closeModal} style={{ background: 'transparent', border: 'none', fontSize: '24px', color: '#9ca3af', cursor: 'pointer' }}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAssignRoutine} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd' }} className="theme-dark-fix-bg theme-dark-fix-border">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0369a1', marginBottom: '8px' }}>Objetivo del Mes</label>
                                <input 
                                    type="text" 
                                    required
                                    className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                    style={{ width: '100%', background: '#fff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px', fontSize: '14px', outline: 'none', color: '#0f172a' }}
                                    placeholder="Ej. Hipertrofia Tren Superior"
                                    value={routineGoal}
                                    onChange={(e) => setRoutineGoal(e.target.value)}
                                />
                            </div>

                            <div>
                                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#374151', marginBottom: '12px' }}>Ejercicios</h4>
                                
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                                    {Object.keys(exercisesByDay).map(day => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => setActiveDay(day)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                background: activeDay === day ? '#3b82f6' : '#f3f4f6',
                                                color: activeDay === day ? '#fff' : '#4b5563',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {exercisesByDay[activeDay].map((exercise, index) => (
                                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'center', background: '#f9fafb', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }} className="theme-dark-fix-bg theme-dark-fix-border">
                                            <input 
                                                type="text" placeholder="Nombre Ejercicio" required list="exercise-suggestions"
                                                className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                style={{ width: '100%', minWidth: '0', boxSizing: 'border-box', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', color: '#111827' }}
                                                value={exercise.name} onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                                            />
                                            <input 
                                                type="number" placeholder="Series" required min="1"
                                                className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                style={{ width: '100%', minWidth: '0', boxSizing: 'border-box', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', color: '#111827' }}
                                                value={exercise.sets} onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                                            />
                                            <input 
                                                type="number" placeholder="Reps" required min="1"
                                                className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                style={{ width: '100%', minWidth: '0', boxSizing: 'border-box', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', color: '#111827' }}
                                                value={exercise.reps} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                                            />
                                            <input 
                                                type="number" placeholder="Peso (Lbs)" step="0.5"
                                                className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                style={{ width: '100%', minWidth: '0', boxSizing: 'border-box', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', color: '#111827' }}
                                                value={exercise.weight} onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                                            />
                                            <button type="button" onClick={() => removeExerciseRow(index)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {exercisesByDay[activeDay].length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '14px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                                            No hay ejercicios para el {activeDay.toLowerCase()}.
                                        </div>
                                    )}
                                </div>
                                <button 
                                    type="button" 
                                    onClick={addExerciseRow}
                                    style={{ marginTop: '12px', background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <FaPlus size={10} /> Agregar ejercicio para el {activeDay.toLowerCase()}
                                </button>
                                
                                <datalist id="exercise-suggestions">
                                    {uniqueExercises.map((ex, i) => (
                                        <option key={i} value={ex} />
                                    ))}
                                </datalist>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                                <button type="button" onClick={closeModal} style={{ background: 'transparent', border: '1px solid #d1d5db', borderRadius: '99px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', color: '#4b5563', cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} className="btn-pill-blue" style={{ padding: '10px 24px' }}>
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