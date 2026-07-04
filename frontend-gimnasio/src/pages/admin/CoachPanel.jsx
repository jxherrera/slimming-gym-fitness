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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [routineGoal, setRoutineGoal] = useState('');
    
    const [exercises, setExercises] = useState([
        { name: '', sets: '', reps: '', weight: '' }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuth();
    const coachId = user?.id || 2; 

    const fetchClients = async () => {
        try {
            const response = await api.get(`/routines/coach/${coachId}/clients`);
            const data = response.data;
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
    const openModal = async (client) => {
        setSelectedClient(client);
        setRoutineGoal(client.Goal || '');
        setExercises([{ name: '', sets: '', reps: '', weight: '' }]); // Reset por defecto
        setIsModalOpen(true);

        // Fetch de la rutina actual con sus ejercicios
        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            const res = await fetch(`${apiBase}/routines/user/${client.UserID}/current`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.routine) {
                    setRoutineGoal(data.routine.Goal || '');
                    if (data.routine.exercises && data.routine.exercises.length > 0) {
                        setExercises(data.routine.exercises);
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

                <div className="settings-sub-header">Alumnos Asignados</div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {clients.length === 0 ? (
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
                                <div className="setting-action">
                                    <button 
                                        type="button" 
                                        className="btn-pill-blue" 
                                        onClick={() => openModal(client)} 
                                        style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <FaDumbbell /> Diseñar Rutina
                                    </button>
                                </div>
                            </div>
                        ))
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {exercises.map((exercise, index) => (
                                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'center', background: '#f9fafb', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }} className="theme-dark-fix-bg theme-dark-fix-border">
                                            <input 
                                                type="text" placeholder="Nombre Ejercicio" required
                                                className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', color: '#111827' }}
                                                value={exercise.name} onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                                            />
                                            <input 
                                                type="number" placeholder="Series" required min="1"
                                                className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', color: '#111827' }}
                                                value={exercise.sets} onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                                            />
                                            <input 
                                                type="number" placeholder="Reps" required min="1"
                                                className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', color: '#111827' }}
                                                value={exercise.reps} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                                            />
                                            <input 
                                                type="number" placeholder="Peso (Lbs)" step="0.5"
                                                className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', color: '#111827' }}
                                                value={exercise.weight} onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                                            />
                                            {exercises.length > 1 ? (
                                                <button type="button" onClick={() => removeExerciseRow(index)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                    <FaTrash size={12} />
                                                </button>
                                            ) : <div style={{ width: '32px' }}></div>}
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    type="button" 
                                    onClick={addExerciseRow}
                                    style={{ marginTop: '12px', background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <FaPlus size={10} /> Agregar otro ejercicio
                                </button>
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