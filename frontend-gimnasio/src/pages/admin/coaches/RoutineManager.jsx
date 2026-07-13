import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { FaUser, FaDumbbell, FaTrash, FaPlus, FaTimes, FaListUl } from 'react-icons/fa';
import '../shared/admin-core.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const RoutineManager = ({ coachId }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const themeClass = isDarkMode ? 'theme-dark' : 'theme-light';
    const themeIcon = isDarkMode ? '☀️' : '🌙';

    const [activeTab, setActiveTab] = useState('templates');
    const [exercises, setExercises] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form state for new exercise
    const [newExercise, setNewExercise] = useState({ name: '', muscleGroup: '', description: '' });
    const [isSubmittingExercise, setIsSubmittingExercise] = useState(false);
    const [editingExerciseId, setEditingExerciseId] = useState(null);

    // Form state for new template
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
    const [editingTemplateId, setEditingTemplateId] = useState(null);
    const [templateForm, setTemplateForm] = useState({ templateName: '', goal: '' });
    const defaultDays = { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [], Sábado: [], Domingo: [] };
    const [templateExercisesByDay, setTemplateExercisesByDay] = useState(defaultDays);
    const [activeDay, setActiveDay] = useState('Lunes');
    const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false);
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    const fetchExercises = async () => {
        try {
            const response = await fetch(`${API_BASE}/routines/catalog/exercises`);
            const data = await response.json();
            if (data.success) setExercises(data.exercises);
        } catch (error) {
            console.error("Error fetching exercises:", error);
        }
    };

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/routines/templates/coach/${coachId}`);
            const data = await response.json();
            if (data.success) setTemplates(data.templates);
        } catch (error) {
            console.error("Error fetching templates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExercises();
        fetchTemplates();
    }, [coachId]);

    const handleCreateExercise = async (e) => {
        e.preventDefault();
        setIsSubmittingExercise(true);
        try {
            const url = editingExerciseId ? `${API_BASE}/routines/catalog/exercises/${editingExerciseId}` : `${API_BASE}/routines/catalog/exercises`;
            const method = editingExerciseId ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExercise)
            });
            const data = await response.json();
            if (data.success) {
                alert(`Ejercicio ${editingExerciseId ? 'actualizado' : 'creado'} exitosamente.`);
                setNewExercise({ name: '', muscleGroup: '', description: '' });
                setEditingExerciseId(null);
                fetchExercises();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al crear/editar ejercicio:", error);
            alert("Error al conectar con el servidor.");
        } finally {
            setIsSubmittingExercise(false);
        }
    };

    const startEditingExercise = (ex) => {
        setEditingExerciseId(ex.ExerciseID);
        setNewExercise({ name: ex.Name, muscleGroup: ex.MuscleGroup || '', description: ex.Description || '' });
    };

    const handleDeleteExercise = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este ejercicio del catálogo?")) return;
        try {
            const response = await fetch(`${API_BASE}/routines/catalog/exercises/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchExercises();
            }
        } catch (error) {
            console.error("Error al eliminar ejercicio:", error);
        }
    };

    const handleTemplateExerciseChange = (index, field, value) => {
        const newDay = [...templateExercisesByDay[activeDay]];
        newDay[index][field] = value;
        setTemplateExercisesByDay({ ...templateExercisesByDay, [activeDay]: newDay });
    };

    const addTemplateExerciseRow = () => {
        setTemplateExercisesByDay({
            ...templateExercisesByDay,
            [activeDay]: [...templateExercisesByDay[activeDay], { name: '', sets: '', reps: '', weight: '' }]
        });
    };

    const removeTemplateExerciseRow = (index) => {
        const newDay = templateExercisesByDay[activeDay].filter((_, i) => i !== index);
        setTemplateExercisesByDay({ ...templateExercisesByDay, [activeDay]: newDay });
    };

    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        setIsSubmittingTemplate(true);
        
        const allExercises = [];
        Object.keys(templateExercisesByDay).forEach(day => {
            templateExercisesByDay[day].forEach(ex => {
                if (ex.name && ex.name.trim() !== '') {
                    allExercises.push({ ...ex, day });
                }
            });
        });

        const payload = {
            coachId,
            templateName: templateForm.templateName,
            goal: templateForm.goal,
            exercises: allExercises
        };

        try {
            const url = editingTemplateId ? `${API_BASE}/routines/templates/${editingTemplateId}` : `${API_BASE}/routines/templates`;
            const method = editingTemplateId ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                alert(`Plantilla ${editingTemplateId ? 'actualizada' : 'creada'} exitosamente.`);
                setIsCreatingTemplate(false);
                setEditingTemplateId(null);
                setTemplateForm({ templateName: '', goal: '' });
                setTemplateExercisesByDay(defaultDays);
                setActiveDay('Lunes');
                fetchTemplates();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error creando/editando plantilla:", error);
            alert("Error al guardar la plantilla.");
        } finally {
            setIsSubmittingTemplate(false);
        }
    };

    const startEditingTemplate = (tpl) => {
        setEditingTemplateId(tpl.TemplateID);
        setTemplateForm({ templateName: tpl.TemplateName, goal: tpl.Goal || '' });
        
        const loadedDays = { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [], Sábado: [], Domingo: [] };
        if (tpl.exercises) {
            tpl.exercises.forEach(ex => {
                if (loadedDays[ex.day]) {
                    loadedDays[ex.day].push({ name: ex.name, sets: ex.sets, reps: ex.reps, weight: ex.weight || '' });
                }
            });
        }
        setTemplateExercisesByDay(loadedDays);
        setActiveDay('Lunes');
        setIsCreatingTemplate(true);
    };

    const handleDeleteTemplate = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta plantilla?")) return;
        try {
            const response = await fetch(`${API_BASE}/routines/templates/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchTemplates();
            }
        } catch (error) {
            console.error("Error al eliminar plantilla:", error);
        }
    };

    return (
        <div className={`admin-page ${themeClass} fade-in`} style={{ padding: '20px' }}>
            <div className="settings-main-card" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 className="settings-title" style={{ marginBottom: '10px' }}>Gestor de Rutinas</h2>
                        <p style={{ color: '#8b8593', marginBottom: '30px', fontSize: '15px' }}>Administra tu catálogo de ejercicios y plantillas.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                            {themeIcon}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <button 
                        onClick={() => { setActiveTab('templates'); setIsCreatingTemplate(false); setEditingTemplateId(null); }} 
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'templates' && !isCreatingTemplate ? '#3b82f6' : 'transparent', color: activeTab === 'templates' && !isCreatingTemplate ? '#fff' : '#8b8593' }}
                    >
                        Plantillas Semanales
                    </button>
                    <button 
                        onClick={() => { setActiveTab('catalog'); setIsCreatingTemplate(false); setEditingTemplateId(null); }} 
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'catalog' && !isCreatingTemplate ? '#10b981' : 'transparent', color: activeTab === 'catalog' && !isCreatingTemplate ? '#fff' : '#8b8593' }}
                    >
                        Catálogo de Ejercicios
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {activeTab === 'catalog' && !isCreatingTemplate && (
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            {/* Formulario Nuevo Ejercicio */}
                            <div style={{ flex: '1', minWidth: '300px' }}>
                                <div style={{ background: 'transparent', padding: '0', borderRadius: '12px' }} className="theme-dark-fix-bg">
                                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }} className="theme-dark-fix-text">
                                        {editingExerciseId ? 'Editar Ejercicio' : 'Añadir Nuevo Ejercicio'}
                                    </h3>
                                    <form onSubmit={handleCreateExercise} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }} className="theme-dark-fix-text">Nombre *</label>
                                            <input 
                                                type="text" required
                                                className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none' }}
                                                value={newExercise.name} onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }} className="theme-dark-fix-text">Grupo Muscular</label>
                                            <input 
                                                type="text"
                                                className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none' }}
                                                placeholder="Ej: Pecho, Piernas"
                                                value={newExercise.muscleGroup} onChange={e => setNewExercise({...newExercise, muscleGroup: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }} className="theme-dark-fix-text">Descripción</label>
                                            <textarea 
                                                className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none' }}
                                                rows="3"
                                                value={newExercise.description} onChange={e => setNewExercise({...newExercise, description: e.target.value})}
                                            />
                                        </div>
                                        {editingExerciseId && (
                                            <button 
                                                type="button" 
                                                onClick={() => { setEditingExerciseId(null); setNewExercise({name: '', muscleGroup: '', description: ''}); }} 
                                                style={{ background: 'transparent', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', color: '#4b5563', cursor: 'pointer', marginBottom: '-8px' }}
                                                className="theme-dark-fix-text"
                                            >
                                                Cancelar Edición
                                            </button>
                                        )}
                                        <button type="submit" disabled={isSubmittingExercise} className="btn-pill-blue" style={{ width: '100%', padding: '12px' }}>
                                            {isSubmittingExercise ? 'Guardando...' : (editingExerciseId ? 'Guardar Cambios' : 'Crear Ejercicio')}
                                        </button>
                                    </form>
                                </div>
                            </div>
                            
                            {/* Lista de Ejercicios */}
                            <div style={{ flex: '2', minWidth: '350px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }} className="theme-dark-fix-text">Ejercicios Disponibles ({exercises.length})</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
                                    {exercises.map(ex => (
                                        <div className="setting-row" key={ex.ExerciseID}>
                                            <div className="setting-icon">
                                                <FaDumbbell />
                                            </div>
                                            <div className="setting-content">
                                                <div className="setting-title">{ex.Name}</div>
                                                <div className="setting-desc">
                                                    {ex.MuscleGroup && <span style={{ color: '#10b981', fontWeight: 'bold' }}>{ex.MuscleGroup}</span>}
                                                    {ex.Description && <span> • {ex.Description}</span>}
                                                </div>
                                            </div>
                                            <div className="setting-action" style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    type="button" 
                                                    onClick={() => startEditingExercise(ex)} 
                                                    style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDeleteExercise(ex.ExerciseID)} 
                                                    style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    <FaTrash /> Quitar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {exercises.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#8b8593', background: '#f4f4f5', borderRadius: '16px' }} className="theme-dark-fix-bg">
                                            No hay ejercicios en el catálogo. ¡Agrega el primero!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'templates' && !isCreatingTemplate && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                <button onClick={() => { setIsCreatingTemplate(true); setEditingTemplateId(null); setTemplateForm({ templateName: '', goal: '' }); setTemplateExercisesByDay(defaultDays); setActiveDay('Lunes'); }} className="btn-pill-blue" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                                    <FaPlus /> Crear Nueva Plantilla
                                </button>
                            </div>
                            
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#8b8593' }}>Cargando plantillas...</div>
                            ) : templates.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#8b8593', background: '#f4f4f5', borderRadius: '16px' }} className="theme-dark-fix-bg">
                                    No has creado ninguna plantilla aún.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {templates.map(tpl => (
                                        <div className="setting-row" key={tpl.TemplateID} style={{ alignItems: 'flex-start' }}>
                                            <div className="setting-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                                <FaListUl />
                                            </div>
                                            <div className="setting-content" style={{ width: '100%' }}>
                                                <div className="setting-title" style={{ fontSize: '18px' }}>{tpl.TemplateName}</div>
                                                <div className="setting-desc" style={{ marginBottom: '12px' }}>
                                                    Objetivo: <strong style={{ color: '#0ea5e9' }}>{tpl.Goal || 'General'}</strong>
                                                </div>
                                                
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                                    {daysOfWeek.map(day => {
                                                        const dayExercises = tpl.exercises?.filter(e => e.day === day) || [];
                                                        if (dayExercises.length === 0) return null;
                                                        return (
                                                            <div key={day} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} className="theme-dark-fix-bg theme-dark-fix-border">
                                                                <h5 style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '8px' }}>{day}</h5>
                                                                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                                                    {dayExercises.map((ex, idx) => (
                                                                        <li key={idx} style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }} className="theme-dark-fix-text">
                                                                            <span>• {ex.name}</span>
                                                                            <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}>{ex.sets}x{ex.reps}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="setting-action" style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    type="button" 
                                                    onClick={() => startEditingTemplate(tpl)} 
                                                    style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDeleteTemplate(tpl.TemplateID)} 
                                                    style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    <FaTrash /> Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {isCreatingTemplate && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }} className="theme-dark-fix-border">
                                <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }} className="theme-dark-fix-text">
                                    {editingTemplateId ? 'Editar Plantilla' : 'Constructor de Plantilla Semanal'}
                                </h3>
                                <button type="button" onClick={() => { setIsCreatingTemplate(false); setEditingTemplateId(null); }} style={{ background: 'transparent', border: 'none', fontSize: '24px', color: '#9ca3af', cursor: 'pointer' }}>
                                    <FaTimes />
                                </button>
                            </div>
                            
                            <form onSubmit={handleCreateTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', display: 'flex', gap: '20px', flexWrap: 'wrap' }} className="theme-dark-fix-bg theme-dark-fix-border">
                                    <div style={{ flex: '1', minWidth: '250px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0369a1', marginBottom: '8px' }}>Nombre de la Plantilla *</label>
                                        <input 
                                            type="text" required
                                            className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                            style={{ width: '100%', background: '#fff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px', fontSize: '14px', outline: 'none' }}
                                            placeholder="Ej. Hipertrofia Avanzada"
                                            value={templateForm.templateName} onChange={e => setTemplateForm({...templateForm, templateName: e.target.value})}
                                        />
                                    </div>
                                    <div style={{ flex: '1', minWidth: '250px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0369a1', marginBottom: '8px' }}>Objetivo Principal</label>
                                        <input 
                                            type="text"
                                            className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                            style={{ width: '100%', background: '#fff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px', fontSize: '14px', outline: 'none' }}
                                            placeholder="Ej. Ganancia Muscular"
                                            value={templateForm.goal} onChange={e => setTemplateForm({...templateForm, goal: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#374151', marginBottom: '12px' }} className="theme-dark-fix-text">Ejercicios</h4>
                                    
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                                        {daysOfWeek.map(day => (
                                            <button
                                                key={day} type="button" onClick={() => setActiveDay(day)}
                                                style={{
                                                    padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                                                    background: activeDay === day ? '#3b82f6' : '#f3f4f6', color: activeDay === day ? '#fff' : '#4b5563', whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {templateExercisesByDay[activeDay].map((exercise, index) => (
                                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'center', background: '#f9fafb', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }} className="theme-dark-fix-bg theme-dark-fix-border">
                                                <input 
                                                    type="text" placeholder="Buscar o escribir ejercicio..." required list="exercise-suggestions"
                                                    className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                    style={{ width: '100%', minWidth: '0', boxSizing: 'border-box', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', color: '#111827' }}
                                                    value={exercise.name} onChange={(e) => handleTemplateExerciseChange(index, 'name', e.target.value)}
                                                />
                                                <input 
                                                    type="number" placeholder="Series" required min="1"
                                                    className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                    style={{ width: '100%', minWidth: '0', boxSizing: 'border-box', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', color: '#111827' }}
                                                    value={exercise.sets} onChange={(e) => handleTemplateExerciseChange(index, 'sets', e.target.value)}
                                                />
                                                <input 
                                                    type="number" placeholder="Reps" required min="1"
                                                    className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                    style={{ width: '100%', minWidth: '0', boxSizing: 'border-box', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', color: '#111827' }}
                                                    value={exercise.reps} onChange={(e) => handleTemplateExerciseChange(index, 'reps', e.target.value)}
                                                />
                                                <input 
                                                    type="number" placeholder="Peso (kg)" step="0.5"
                                                    className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                                                    style={{ width: '100%', minWidth: '0', boxSizing: 'border-box', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', color: '#111827' }}
                                                    value={exercise.weight} onChange={(e) => handleTemplateExerciseChange(index, 'weight', e.target.value)}
                                                />
                                                <button type="button" onClick={() => removeTemplateExerciseRow(index)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {templateExercisesByDay[activeDay].length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '14px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                                                No hay ejercicios para el {activeDay.toLowerCase()}.
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        type="button" onClick={addTemplateExerciseRow}
                                        style={{ marginTop: '12px', background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <FaPlus size={10} /> Agregar ejercicio para el {activeDay.toLowerCase()}
                                    </button>
                                    
                                    <datalist id="exercise-suggestions">
                                        {exercises.map((ex, i) => (
                                            <option key={i} value={ex.Name} />
                                        ))}
                                    </datalist>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                                    <button type="button" onClick={() => { setIsCreatingTemplate(false); setEditingTemplateId(null); }} style={{ background: 'transparent', border: '1px solid #d1d5db', borderRadius: '99px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', color: '#4b5563', cursor: 'pointer' }} className="theme-dark-fix-text">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSubmittingTemplate} className="btn-pill-blue" style={{ padding: '10px 24px' }}>
                                        {isSubmittingTemplate ? 'Guardando...' : (editingTemplateId ? 'Guardar Cambios' : 'Guardar Plantilla')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoutineManager;
