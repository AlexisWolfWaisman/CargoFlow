/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { fetchData, addItem, updateItem, deleteItem } from './api.tsx';

// --- SVG Icons ---
const Icon = ({ path, className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);
const DashboardIcon = () => <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />;
const ViajesIcon = () => <Icon path="M13 10V3L4 14h7v7l9-11h-7z" />;
const GastosIcon = () => <Icon path="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />;
const ChoferesIcon = () => <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
const CamionesIcon = () => <Icon path="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />;
const AcopladosIcon = () => <Icon path="M20 12H4m16 0a4 4 0 10-8 0 4 4 0 008 0zm-8 0a4 4 0 11-8 0 4 4 0 018 0z" />;
const PolizasIcon = () => <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
const InformesIcon = () => <Icon path="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
const SettingsIcon = () => <Icon path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />;
const EditIcon = () => <Icon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536l12.232-12.232z" className="h-5 w-5" />;
const DeleteIcon = () => <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="h-5 w-5" />;
const ViewIcon = () => <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" className="h-5 w-5" />;
const NoImageIcon = () => <Icon path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" className="h-10 w-10"/>;

const formatCurrency = (amount, currencyCode) => {
    try {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch (e) {
        return `${currencyCode} ${amount.toLocaleString('es-PY')}`;
    }
};

const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return ''; // Return empty string for invalid dates
    
    // Get local date components
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const App = () => {
    const [activeView, setActiveView] = useState('dashboard');
    
    // --- Centralized State ---
    const [choferes, setChoferes] = useState([]);
    const [camiones, setCamiones] = useState([]);
    const [acoplados, setAcoplados] = useState([]);
    const [viajes, setViajes] = useState([]);
    const [polizas, setPolizas] = useState([]);
    const [tiposDeGasto, setTiposDeGasto] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [vehiculoEstados, setVehiculoEstados] = useState([]);
    const [viajeEstados, setViajeEstados] = useState([]);

    const endpointToSetterMap = {
        'choferes': setChoferes,
        'camiones': setCamiones,
        'acoplados': setAcoplados,
        'viajes': setViajes,
        'polizas': setPolizas,
        'tiposDeGasto': setTiposDeGasto,
        'gastos': setGastos,
    };

    const loadAllData = async () => {
        try {
            const [
                choferesData, camionesData, acopladosData, viajesData, polizasData,
                tiposDeGastoData, gastosData, currenciesData, vehiculoEstadosData, viajeEstadosData
            ] = await Promise.all([
                fetchData('choferes'),
                fetchData('camiones'),
                fetchData('acoplados'),
                fetchData('viajes'),
                fetchData('polizas'),
                fetchData('tiposDeGasto'),
                fetchData('gastos'),
                fetchData('currencies'),
                fetchData('vehiculoEstados'),
                fetchData('viajeEstados'),
            ]);
            setChoferes(choferesData);
            setCamiones(camionesData);
            setAcoplados(acopladosData);
            setViajes(viajesData);
            setPolizas(polizasData);
            setTiposDeGasto(tiposDeGastoData);
            setGastos(gastosData);
            setCurrencies(currenciesData);
            setVehiculoEstados(vehiculoEstadosData);
            setViajeEstados(viajeEstadosData);
        } catch (error) {
            console.error("Error loading all data:", error);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleAdd = (endpoint: string, refetchEndpoint: string) => async (newItem: any) => {
        try {
            await addItem(endpoint, newItem);
            const data = await fetchData(refetchEndpoint);
            const setter = endpointToSetterMap[refetchEndpoint];
            if (setter) {
                setter(data);
            }
        } catch (error) {
            console.error(`Error adding item to ${endpoint}:`, error);
        }
    };

    const handleUpdate = (endpoint: string, idKey = 'id') => async (updatedItem: any) => {
        try {
            await updateItem(endpoint, updatedItem[idKey], updatedItem);
            const refetchEndpoint = endpoint.split('/')[0];
            const data = await fetchData(refetchEndpoint);
            const setter = endpointToSetterMap[refetchEndpoint];
            if (setter) {
                setter(data);
            }
        } catch (error) {
            console.error(`Error updating item at ${endpoint}:`, error);
        }
    };

    const handleDelete = (endpoint: string, refetchEndpoint: string) => async (id: string | number) => {
        try {
            await deleteItem(endpoint, id);
            const data = await fetchData(refetchEndpoint);
            const setter = endpointToSetterMap[refetchEndpoint];
            if (setter) {
                setter(data);
            }
        } catch (error) {
            console.error(`Error deleting item from ${endpoint}:`, error);
        }
    };

    const handleDeleteTipoGasto = async (id) => {
        if (gastos.some(gasto => gasto.tipoId === id)) {
            alert('No se puede eliminar un tipo de gasto que está en uso.');
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres eliminar este tipo de gasto?')) {
            await handleDelete('tiposDeGasto', 'tiposDeGasto')(id);
        }
    };
    
    const handleAddTipoGasto = async (nombreTipo) => {
        if (tiposDeGasto.some(tipo => tipo.nombre.toLowerCase() === nombreTipo.toLowerCase())) {
            alert('Este tipo de gasto ya existe.');
            return false;
        }
        await handleAdd('tiposDeGasto', 'tiposDeGasto')({ nombre: nombreTipo });
        return true;
    };

    const renderContent = () => {
        switch (activeView) {
            case 'choferes': return <ChoferesManager choferes={choferes} onAdd={handleAdd('choferes', 'choferes')} onUpdate={handleUpdate('choferes')} onDelete={handleDelete('choferes', 'choferes')} />;
            case 'camiones': return <CamionesManager camiones={camiones} estados={vehiculoEstados} onAdd={handleAdd('camiones', 'camiones')} onUpdate={handleUpdate('camiones', 'dominio')} onDelete={handleDelete('camiones', 'camiones')} />;
            case 'acoplados': return <AcopladosManager acoplados={acoplados} estados={vehiculoEstados} onAdd={handleAdd('acoplados', 'acoplados')} onUpdate={handleUpdate('acoplados', 'dominio')} onDelete={handleDelete('acoplados', 'acoplados')} />;
            case 'viajes': return <ViajesManager viajes={viajes} choferes={choferes} camiones={camiones} acoplados={acoplados} estados={viajeEstados} onAdd={handleAdd('viajes', 'viajes')} onUpdate={handleUpdate('viajes')} onDelete={handleDelete('viajes', 'viajes')} />;
            case 'polizas': return <PolizasManager polizas={polizas} camiones={camiones} acoplados={acoplados} onAdd={handleAdd('polizas', 'polizas')} onUpdate={handleUpdate('polizas')} onDelete={handleDelete('polizas', 'polizas')} />;
            case 'gastos': return <GastosManager gastos={gastos} tiposDeGasto={tiposDeGasto} currencies={currencies} viajes={viajes} onAddGasto={handleAdd('gastos', 'gastos')} onUpdateGasto={handleUpdate('gastos')} onDeleteGasto={handleDelete('gastos', 'gastos')} />;
            case 'informes': return <InformesManager viajes={viajes} />;
            case 'configuracion': return <ConfiguracionManager tiposDeGasto={tiposDeGasto} currencies={currencies} onAddTipo={handleAddTipoGasto} onDeleteTipo={handleDeleteTipoGasto} />;
            default: return <Dashboard viajes={viajes} choferes={choferes} camiones={camiones} polizas={polizas} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 text-slate-800">
            <Sidebar setActiveView={setActiveView} activeView={activeView} />
            <main className="flex-1 p-8 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

// --- Components (Sidebar, Dashboard, Managers, Modals, Fields) remain mostly the same, only logic handlers are changed in App ---
// The following components are largely unchanged in their JSX, but their props now come from fetched data.

const Sidebar = ({ setActiveView, activeView }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { id: 'viajes', label: 'Viajes', icon: <ViajesIcon /> },
        { id: 'gastos', label: 'Gastos', icon: <GastosIcon /> },
        { id: 'choferes', label: 'Choferes', icon: <ChoferesIcon /> },
        { id: 'camiones', label: 'Camiones', icon: <CamionesIcon /> },
        { id: 'acoplados', label: 'Acoplados', icon: <AcopladosIcon /> },
        { id: 'polizas', label: 'Pólizas', icon: <PolizasIcon /> },
        { id: 'informes', label: 'Informes', icon: <InformesIcon /> },
        { id: 'configuracion', label: 'Configuración', icon: <SettingsIcon /> },
    ];
    const appVersion = "1.0.1-hotfix";

    return (
        <aside className="w-64 bg-white shadow-lg flex flex-col">
            <div className="p-6 border-b border-slate-200">
                <h1 className="text-3xl font-bold text-indigo-600">CargoFlow</h1>
                <div className="flex items-center mt-2 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-sm font-semibold">BLSLogistica</span>
                </div>
            </div>
            <nav className="flex-1 mt-4">
                <ul>
                    {navItems.map(item => (
                        <li key={item.id} className="px-4">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveView(item.id); }}
                                className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                                    activeView === item.id 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-slate-200">
                <p className="text-xs text-center text-slate-500">© 2025 CargoFlow {appVersion}</p>
            </div>
        </aside>
    );
};

const Dashboard = ({ viajes, choferes, camiones, polizas }) => {
    const viajesActivos = viajes.filter(v => v.estado === 'En Curso');
    const choferesEnViajeIds = new Set(viajesActivos.map(v => v.choferId));
    const choferesDisponibles = choferes.length - choferesEnViajeIds.size;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const polizasVencidas = polizas.filter(p => new Date(p.finVigencia) < hoy);
    
    const polizasPorVencer = polizas.filter(p => {
        const fin = new Date(p.finVigencia);
        fin.setHours(0,0,0,0);
        const diffTime = fin.getTime() - hoy.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
    });
    
    const camionesEnMantenimiento = camiones.filter(c => c.estado === 'En Mantenimiento');

    const alertas = [
        ...polizasVencidas.map(p => ({ type: 'error', message: `Póliza vencida para ${p.vehiculoDominio} el ${new Date(p.finVigencia).toLocaleDateString()}.` })),
        ...polizasPorVencer.map(p => ({ type: 'warning', message: `Póliza para ${p.vehiculoDominio} vence el ${new Date(p.finVigencia).toLocaleDateString()}.` })),
        ...camionesEnMantenimiento.map(c => ({ type: 'info', message: `Camión ${c.dominio} (${c.modelo}) está en mantenimiento.` })),
    ];
    
    const alertConfig = {
        error:   { icon: '🚨', styles: { container: 'border-red-500 bg-red-50', text: 'text-red-800' } },
        warning: { icon: '⚠️', styles: { container: 'border-yellow-500 bg-yellow-50', text: 'text-yellow-800' } },
        info:    { icon: 'ℹ️', styles: { container: 'border-blue-500 bg-blue-50', text: 'text-blue-800' } },
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-lg text-slate-600">Viajes Activos</h3>
                    <p className="text-5xl font-bold text-indigo-600 mt-2">{viajesActivos.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-lg text-slate-600">Choferes Disponibles</h3>
                    <p className="text-5xl font-bold text-green-600 mt-2">{choferesDisponibles}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-lg text-slate-600">Alertas Críticas</h3>
                    <p className={`text-5xl font-bold mt-2 ${alertas.length > 0 ? 'text-red-600' : 'text-slate-600'}`}>{alertas.length}</p>
                </div>
            </div>
            
            <div className="mt-8 bg-white p-8 rounded-xl shadow-sm">
                 <h2 className="text-xl font-semibold mb-4 text-slate-700">Detalle de Alertas</h2>
                 {alertas.length > 0 ? (
                    <ul className="space-y-3">
                        {alertas.map((alerta, index) => {
                            const { icon, styles } = alertConfig[alerta.type];
                            return (
                                <li key={index} className={`flex items-start p-4 rounded-lg border-l-4 ${styles.container}`}>
                                    <span className="text-2xl mr-4">{icon}</span>
                                    <p className={`text-md ${styles.text}`}>{alerta.message}</p>
                                </li>
                            );
                        })}
                    </ul>
                 ) : (
                    <div className="text-center py-8">
                        <span className="text-5xl mb-4 block">✅</span>
                        <p className="text-lg text-slate-600">¡Todo en orden! No hay alertas críticas.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

const ChoferesManager = ({ choferes, onAdd, onUpdate, onDelete }) => {
    const [formData, setFormData] = useState({ nombre: '', apellido: '', nacionalidad: '', identificacion: '', identificacionLaboral: '', telefono: '', email: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [editingChofer, setEditingChofer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        alert('Chofer registrado con éxito');
        setFormData({ nombre: '', apellido: '', nacionalidad: '', identificacion: '', identificacionLaboral: '', telefono: '', email: '' });
    };

    const handleDelete = (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar al chofer ${nombre}?`)) onDelete(id);
    };

    const handleEditClick = (chofer) => {
        setEditingChofer(chofer);
        setIsModalOpen(true);
    };

    const handleUpdateChofer = (updatedChofer) => {
        onUpdate(updatedChofer);
        setIsModalOpen(false);
        setEditingChofer(null);
    };

    const filteredChoferes = choferes.filter(chofer =>
        `${chofer.nombre} ${chofer.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chofer.identificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chofer.nacionalidad || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chofer.identificacionLaboral || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Choferes</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-6">Registrar Nuevo Chofer</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} />
                    <InputField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} />
                    <InputField label="Nacionalidad" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} />
                    <InputField label="Identificación" name="identificacion" value={formData.identificacion} onChange={handleChange} />
                    <InputField label="Identificación Laboral" name="identificacionLaboral" value={formData.identificacionLaboral} onChange={handleChange} placeholder="Pasaporte, credencial, etc." required={false} />
                    <InputField label="Teléfono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} />
                    <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <div className="md:col-span-2 flex justify-end">
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300">Guardar Chofer</button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Listado de Choferes</h2>
                    <InputField label="" name="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." required={false} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Nombre Completo</th>
                                <th className="p-4 font-semibold text-slate-600">Identificaciones</th>
                                <th className="p-4 font-semibold text-slate-600">Contacto</th>
                                <th className="p-4 font-semibold text-slate-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredChoferes.map((chofer) => (
                                <tr key={chofer.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4"><div className="font-medium text-slate-900">{chofer.nombre} {chofer.apellido}</div><div className="text-sm text-slate-500">{chofer.nacionalidad || 'N/A'}</div></td>
                                    <td className="p-4"><div className="text-slate-900">ID Personal: {chofer.identificacion}</div><div className="text-sm text-slate-500">ID Laboral: {chofer.identificacionLaboral || 'N/A'}</div></td>
                                    <td className="p-4"><div className="text-slate-900">{chofer.telefono}</div><div className="text-sm text-slate-500">{chofer.email}</div></td>
                                    <td className="p-4 flex items-center gap-2">
                                        <button onClick={() => handleEditClick(chofer)} className="text-slate-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-100" title="Editar"><EditIcon /></button>
                                        <button onClick={() => handleDelete(chofer.id, chofer.nombre)} className="text-slate-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-100" title="Borrar"><DeleteIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <EditChoferModal chofer={editingChofer} onClose={() => setIsModalOpen(false)} onSave={handleUpdateChofer} />}
        </div>
    );
};

const EditChoferModal = ({ chofer, onClose, onSave }) => {
    const [formData, setFormData] = useState(chofer);

    useEffect(() => setFormData(chofer), [chofer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (window.confirm('¿Estás seguro de que quieres guardar los cambios?')) onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Editar Chofer</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} />
                    <InputField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} />
                    <InputField label="Nacionalidad" name="nacionalidad" value={formData.nacionalidad || ''} onChange={handleChange} />
                    <InputField label="Identificación" name="identificacion" value={formData.identificacion} onChange={handleChange} />
                    <InputField label="Identificación Laboral" name="identificacionLaboral" value={formData.identificacionLaboral || ''} onChange={handleChange} placeholder="Pasaporte, credencial, etc." required={false} />
                    <InputField label="Teléfono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} />
                    <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                         <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CamionesManager = ({ camiones, estados, onAdd, onUpdate, onDelete }) => {
    const [formData, setFormData] = useState({ dominio: '', modelo: '', estado: estados[0]?.nombre || '', foto: null, chasis: '', marca: '', tipo: '', color: '', año: '' });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTruck, setEditingTruck] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [viewingTruck, setViewingTruck] = useState(null);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setFormData(prev => ({ ...prev, foto: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        alert('Camión registrado con éxito');
        setFormData({ dominio: '', modelo: '', estado: estados[0]?.nombre || '', foto: null, chasis: '', marca: '', tipo: '', color: '', año: '' });
        setPhotoPreview(null);
    };

    const handleDelete = (dominio) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el camión ${dominio}?`)) onDelete(dominio);
    };

    const handleEditClick = (camion) => {
        setEditingTruck(camion);
        setIsModalOpen(true);
    };

    const handleUpdateTruck = (updatedTruck) => {
        onUpdate(updatedTruck);
        setIsModalOpen(false);
        setEditingTruck(null);
    };

    const handleViewPhotoClick = (camion) => {
        setViewingTruck(camion);
        setIsPhotoModalOpen(true);
    };

    const handleUpdatePhoto = (dominio, newPhoto) => {
        const truckToUpdate = camiones.find(c => c.dominio === dominio);
        if (truckToUpdate) onUpdate({ ...truckToUpdate, foto: newPhoto });
        setIsPhotoModalOpen(false);
        setViewingTruck(null);
    };

    const statusColors = { 'Disponible': 'bg-green-100 text-green-800', 'En Viaje': 'bg-blue-100 text-blue-800', 'En Mantenimiento': 'bg-yellow-100 text-yellow-800' };
    const filteredCamiones = camiones.filter(c => Object.values(c).join(' ').toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Camiones</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-6">Registrar Nuevo Camión</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Dominio (Patente)" name="dominio" value={formData.dominio} onChange={handleChange} placeholder="ABC 123 CD"/>
                    <InputField label="Marca" name="marca" value={formData.marca} onChange={handleChange} placeholder="Ej: Scania"/>
                    <InputField label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange} placeholder="Ej: R450"/>
                    <InputField label="Año" name="año" type="number" value={formData.año} onChange={handleChange} placeholder="Ej: 2022"/>
                    <InputField label="Color" name="color" value={formData.color} onChange={handleChange} placeholder="Ej: Rojo"/>
                    <InputField label="Tipo" name="tipo" value={formData.tipo} onChange={handleChange} placeholder="Ej: Tractor, Chasis"/>
                    <InputField label="Chasis" name="chasis" value={formData.chasis} onChange={handleChange} placeholder="Número de chasis"/>
                    <SelectField label="Estado" name="estado" value={formData.estado} onChange={handleChange}>
                        {estados.map(estado => <option key={estado.id} value={estado.nombre}>{estado.nombre}</option>)}
                    </SelectField>
                     <div className="md:col-span-3">
                        <label htmlFor="foto" className="block text-sm font-medium text-slate-700 mb-1">Foto del Camión</label>
                        <input type="file" name="foto" id="foto" accept="image/*" onChange={handlePhotoChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                        {photoPreview && <img src={photoPreview} alt="Vista previa" className="mt-4 h-24 w-auto rounded-lg object-cover" />}
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300">Guardar Camión</button>
                    </div>
                </form>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Listado de Camiones</h2>
                    <InputField label="" name="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." required={false} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Foto</th>
                                <th className="p-4 font-semibold text-slate-600">Dominio</th>
                                <th className="p-4 font-semibold text-slate-600">Marca / Modelo</th>
                                <th className="p-4 font-semibold text-slate-600">Año</th>
                                <th className="p-4 font-semibold text-slate-600">Estado</th>
                                <th className="p-4 font-semibold text-slate-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCamiones.map((camion) => (
                                <tr key={camion.dominio} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">
                                        {camion.foto ? <img src={camion.foto} alt={`Foto de ${camion.dominio}`} className="h-12 w-16 object-cover rounded-md" /> : <div className="h-12 w-16 bg-slate-200 rounded-md flex items-center justify-center text-slate-400"><NoImageIcon /></div>}
                                    </td>
                                    <td className="p-4 font-mono">{camion.dominio}</td>
                                    <td className="p-4"><div className="font-medium">{camion.marca}</div><div className="text-sm text-slate-500">{camion.modelo}</div></td>
                                    <td className="p-4">{camion.año}</td>
                                    <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[camion.estado]}`}>{camion.estado}</span></td>
                                    <td className="p-4 flex items-center gap-2">
                                        <button onClick={() => handleViewPhotoClick(camion)} className="text-slate-500 hover:text-green-600 p-2 rounded-full hover:bg-green-100" title="Ver foto"><ViewIcon /></button>
                                        <button onClick={() => handleEditClick(camion)} className="text-slate-500 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-100" title="Editar"><EditIcon /></button>
                                        <button onClick={() => handleDelete(camion.dominio)} className="text-slate-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100" title="Borrar"><DeleteIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <EditTruckModal truck={editingTruck} estados={estados} onClose={() => setIsModalOpen(false)} onSave={handleUpdateTruck} />}
            {isPhotoModalOpen && <PhotoViewModal truck={viewingTruck} onClose={() => setIsPhotoModalOpen(false)} onSave={handleUpdatePhoto} />}
        </div>
    );
};

const EditTruckModal = ({ truck, estados, onClose, onSave }) => {
    const [formData, setFormData] = useState(truck);
    const [photoPreview, setPhotoPreview] = useState(truck.foto);

    useEffect(() => { setFormData(truck); setPhotoPreview(truck.foto); }, [truck]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setPhotoPreview(reader.result); setFormData(prev => ({ ...prev, foto: reader.result })); };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (window.confirm('¿Estás seguro de que quieres guardar los cambios?')) onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">Editar Camión</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Dominio (Patente)" name="dominio" value={formData.dominio} onChange={handleChange} />
                    <InputField label="Marca" name="marca" value={formData.marca || ''} onChange={handleChange} />
                    <InputField label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange} />
                    <InputField label="Año" name="año" type="number" value={formData.año || ''} onChange={handleChange} />
                    <InputField label="Color" name="color" value={formData.color || ''} onChange={handleChange} />
                    <InputField label="Tipo" name="tipo" value={formData.tipo || ''} onChange={handleChange} />
                    <InputField label="Chasis" name="chasis" value={formData.chasis || ''} onChange={handleChange} />
                    <SelectField label="Estado" name="estado" value={formData.estado} onChange={handleChange}>
                        {estados.map(estado => <option key={estado.id} value={estado.nombre}>{estado.nombre}</option>)}
                    </SelectField>
                    <div className="md:col-span-2">
                        <label htmlFor="foto_modal" className="block text-sm font-medium text-slate-700 mb-1">Foto del Camión</label>
                        <input type="file" name="foto" id="foto_modal" accept="image/*" onChange={handlePhotoChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                        {photoPreview && <img src={photoPreview} alt="Vista previa" className="mt-4 h-24 w-auto rounded-lg object-cover" />}
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                         <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PhotoViewModal = ({ truck, onClose, onSave }) => {
    const [newPhoto, setNewPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(truck.foto);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setNewPhoto(reader.result); setPhotoPreview(reader.result); };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPhoto && window.confirm('¿Estás seguro de que quieres guardar la nueva foto?')) onSave(truck.dominio, newPhoto);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Foto del Camión: <span className="font-mono">{truck.dominio}</span></h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6 flex justify-center items-center bg-slate-100 rounded-lg min-h-[250px] p-4">
                        {photoPreview ? <img src={photoPreview} alt={`Foto de ${truck.dominio}`} className="max-h-64 max-w-full object-contain rounded-md" /> : <div className="text-slate-400 text-center"><NoImageIcon /><p>Sin imagen disponible</p></div>}
                    </div>
                    <div>
                        <label htmlFor="foto_modal_view" className="block text-sm font-medium text-slate-700 mb-1">{truck.foto ? 'Reemplazar foto' : 'Cargar foto'}</label>
                        <input type="file" name="foto" id="foto_modal_view" accept="image/*" onChange={handlePhotoChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                         <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300">Cerrar</button>
                        <button type="submit" disabled={!newPhoto} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AcopladosManager = ({ acoplados, estados, onAdd, onUpdate, onDelete }) => {
    const [formData, setFormData] = useState({ dominio: '', modelo: '', estado: estados[0]?.nombre || '', marca: '', chasis: '', tipo: '', color: '', año: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [editingAcoplado, setEditingAcoplado] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        alert('Acoplado registrado con éxito');
        setFormData({ dominio: '', modelo: '', estado: estados[0]?.nombre || '', marca: '', chasis: '', tipo: '', color: '', año: '' });
    };

    const handleDelete = (dominio) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el acoplado ${dominio}?`)) onDelete(dominio);
    };

    const handleEditClick = (acoplado) => {
        setEditingAcoplado(acoplado);
        setIsModalOpen(true);
    };

    const handleUpdateAcoplado = (updatedAcoplado) => {
        onUpdate(updatedAcoplado);
        setIsModalOpen(false);
        setEditingAcoplado(null);
    };

    const statusColors = { 'Disponible': 'bg-green-100 text-green-800', 'En Viaje': 'bg-blue-100 text-blue-800', 'En Mantenimiento': 'bg-yellow-100 text-yellow-800' };
    const filteredAcoplados = acoplados.filter(a => Object.values(a).join(' ').toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Acoplados</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-6">Registrar Nuevo Acoplado</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Dominio (Patente)" name="dominio" value={formData.dominio} onChange={handleChange} />
                    <InputField label="Marca" name="marca" value={formData.marca} onChange={handleChange} />
                    <InputField label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange} />
                    <InputField label="Año" name="año" type="number" value={formData.año} onChange={handleChange} />
                    <InputField label="Color" name="color" value={formData.color} onChange={handleChange} />
                    <InputField label="Tipo" name="tipo" value={formData.tipo} onChange={handleChange} />
                    <InputField label="Chasis" name="chasis" value={formData.chasis} onChange={handleChange} />
                    <SelectField label="Estado" name="estado" value={formData.estado} onChange={handleChange}>
                        {estados.map(estado => <option key={estado.id} value={estado.nombre}>{estado.nombre}</option>)}
                    </SelectField>
                    <div className="md:col-span-3 flex justify-end">
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">Guardar Acoplado</button>
                    </div>
                </form>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Listado de Acoplados</h2>
                    <InputField label="" name="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." required={false} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Dominio</th>
                                <th className="p-4 font-semibold text-slate-600">Marca / Modelo</th>
                                <th className="p-4 font-semibold text-slate-600">Año</th>
                                <th className="p-4 font-semibold text-slate-600">Estado</th>
                                <th className="p-4 font-semibold text-slate-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAcoplados.map((acoplado) => (
                                <tr key={acoplado.dominio} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4 font-mono">{acoplado.dominio}</td>
                                    <td className="p-4"><div className="font-medium">{acoplado.marca}</div><div className="text-sm text-slate-500">{acoplado.modelo}</div></td>
                                    <td className="p-4">{acoplado.año}</td>
                                    <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[acoplado.estado]}`}>{acoplado.estado}</span></td>
                                    <td className="p-4 flex items-center gap-2">
                                        <button onClick={() => handleEditClick(acoplado)} className="text-slate-500 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-100" title="Editar"><EditIcon /></button>
                                        <button onClick={() => handleDelete(acoplado.dominio)} className="text-slate-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100" title="Borrar"><DeleteIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <EditAcopladoModal acoplado={editingAcoplado} estados={estados} onClose={() => setIsModalOpen(false)} onSave={handleUpdateAcoplado} />}
        </div>
    );
};

const EditAcopladoModal = ({ acoplado, estados, onClose, onSave }) => {
    const [formData, setFormData] = useState(acoplado);
    useEffect(() => { setFormData(acoplado); }, [acoplado]);
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => {
        e.preventDefault();
        if (window.confirm('¿Estás seguro de que quieres guardar los cambios?')) onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-xl">
                <h2 className="text-2xl font-bold mb-6">Editar Acoplado</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Dominio" name="dominio" value={formData.dominio} onChange={handleChange} />
                    <InputField label="Marca" name="marca" value={formData.marca || ''} onChange={handleChange} />
                    <InputField label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange} />
                    <InputField label="Año" name="año" type="number" value={formData.año || ''} onChange={handleChange} />
                    <InputField label="Color" name="color" value={formData.color || ''} onChange={handleChange} />
                    <InputField label="Tipo" name="tipo" value={formData.tipo || ''} onChange={handleChange} />
                    <InputField label="Chasis" name="chasis" value={formData.chasis || ''} onChange={handleChange} className="md:col-span-2" />
                    <SelectField label="Estado" name="estado" value={formData.estado} onChange={handleChange} className="md:col-span-2">
                        {estados.map(estado => <option key={estado.id} value={estado.nombre}>{estado.nombre}</option>)}
                    </SelectField>
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                         <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ViajesManager = ({ viajes, choferes, camiones, acoplados, estados, onAdd, onUpdate, onDelete }) => {
    const [formData, setFormData] = useState({ choferId: '', camionDominio: '', acopladoDominio: '', origen: '', destino: '', fechaInicio: '', fechaFin: '', estado: estados[0]?.nombre || '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [editingViaje, setEditingViaje] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ ...formData, choferId: Number(formData.choferId) });
        alert('Viaje registrado con éxito');
        setFormData({ choferId: '', camionDominio: '', acopladoDominio: '', origen: '', destino: '', fechaInicio: '', fechaFin: '', estado: estados[0]?.nombre || '' });
    };

    const handleDelete = (id) => { if (window.confirm(`¿Estás seguro de que quieres eliminar este viaje?`)) onDelete(id); };
    const handleEditClick = (viaje) => { setEditingViaje(viaje); setIsModalOpen(true); };
    const handleUpdateViaje = (updatedViaje) => { onUpdate(updatedViaje); setIsModalOpen(false); setEditingViaje(null); };
    
    const getChoferFullName = (choferId) => {
        const chofer = choferes.find(c => c.id === choferId);
        return chofer ? `${chofer.nombre} ${chofer.apellido}` : 'N/A';
    };

    const filteredViajes = viajes.filter(viaje => {
        const choferName = getChoferFullName(viaje.choferId);
        return `${viaje.origen} ${viaje.destino} ${choferName} ${viaje.camionDominio} ${viaje.acopladoDominio}`.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    const statusColors = { 'Programado': 'bg-slate-100 text-slate-800', 'En Curso': 'bg-blue-100 text-blue-800', 'Finalizado': 'bg-green-100 text-green-800', 'Cancelado': 'bg-red-100 text-red-800' };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Viajes</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-6">Registrar Nuevo Viaje</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SelectField label="Chofer" name="choferId" value={formData.choferId} onChange={handleChange}><option value="">Seleccionar Chofer</option>{choferes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}</SelectField>
                    <SelectField label="Camión" name="camionDominio" value={formData.camionDominio} onChange={handleChange}><option value="">Seleccionar Camión</option>{camiones.map(c => <option key={c.dominio} value={c.dominio}>{c.dominio} ({c.modelo})</option>)}</SelectField>
                    <SelectField label="Acoplado" name="acopladoDominio" value={formData.acopladoDominio} onChange={handleChange}><option value="">Seleccionar Acoplado</option>{acoplados.map(a => <option key={a.dominio} value={a.dominio}>{a.dominio} ({a.modelo})</option>)}</SelectField>
                    <InputField label="Origen" name="origen" value={formData.origen} onChange={handleChange} />
                    <InputField label="Destino" name="destino" value={formData.destino} onChange={handleChange} />
                    <SelectField label="Estado" name="estado" value={formData.estado} onChange={handleChange}>{estados.map(estado => <option key={estado.id} value={estado.nombre}>{estado.nombre}</option>)}</SelectField>
                    <InputField label="Fecha/Hora Inicio" name="fechaInicio" type="datetime-local" value={formData.fechaInicio} onChange={handleChange} />
                    <InputField label="Fecha/Hora Fin" name="fechaFin" type="datetime-local" value={formData.fechaFin} onChange={handleChange} required={false} />
                    <div className="lg:col-span-3 flex justify-end">
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">Guardar Viaje</button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Listado de Viajes</h2>
                    <InputField label="" name="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." required={false} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Origen/Destino</th>
                                <th className="p-4 font-semibold text-slate-600">Chofer</th>
                                <th className="p-4 font-semibold text-slate-600">Vehículos</th>
                                <th className="p-4 font-semibold text-slate-600">Fechas</th>
                                <th className="p-4 font-semibold text-slate-600">Estado</th>
                                <th className="p-4 font-semibold text-slate-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredViajes.map((viaje) => (
                                <tr key={viaje.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4"><div className="font-medium">{viaje.origen}</div><div className="text-sm text-slate-500">→ {viaje.destino}</div></td>
                                    <td className="p-4">{getChoferFullName(viaje.choferId)}</td>
                                    <td className="p-4"><div className="font-mono text-sm">Cam: {viaje.camionDominio}</div><div className="font-mono text-sm">Acop: {viaje.acopladoDominio}</div></td>
                                    <td className="p-4 text-sm"><div>Inicio: {viaje.fechaInicio ? new Date(viaje.fechaInicio).toLocaleString() : 'N/A'}</div><div>Fin: {viaje.fechaFin ? new Date(viaje.fechaFin).toLocaleString() : 'Pendiente'}</div></td>
                                    <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[viaje.estado]}`}>{viaje.estado}</span></td>
                                    <td className="p-4 flex items-center gap-2">
                                        <button onClick={() => handleEditClick(viaje)} className="text-slate-500 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-100" title="Editar"><EditIcon /></button>
                                        <button onClick={() => handleDelete(viaje.id)} className="text-slate-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100" title="Borrar"><DeleteIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <EditViajeModal viaje={editingViaje} choferes={choferes} camiones={camiones} acoplados={acoplados} estados={estados} onClose={() => setIsModalOpen(false)} onSave={handleUpdateViaje} />}
        </div>
    );
};

const EditViajeModal = ({ viaje, choferes, camiones, acoplados, estados, onClose, onSave }) => {
    const [formData, setFormData] = useState({ 
        ...viaje,
        choferId: String(viaje.choferId),
        fechaInicio: formatDateTimeLocal(viaje.fechaInicio),
        fechaFin: formatDateTimeLocal(viaje.fechaFin),
    });
    useEffect(() => { setFormData({ 
        ...viaje, 
        choferId: String(viaje.choferId),
        fechaInicio: formatDateTimeLocal(viaje.fechaInicio),
        fechaFin: formatDateTimeLocal(viaje.fechaFin),
    }); }, [viaje]);
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => {
        e.preventDefault();
        if (window.confirm('¿Estás seguro de que quieres guardar los cambios?')) {
            const updatedViaje = { ...formData, choferId: Number(formData.choferId) };
            onSave(updatedViaje);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Editar Viaje</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Chofer" name="choferId" value={formData.choferId} onChange={handleChange}>{choferes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}</SelectField>
                    <SelectField label="Camión" name="camionDominio" value={formData.camionDominio} onChange={handleChange}>{camiones.map(c => <option key={c.dominio} value={c.dominio}>{c.dominio} ({c.modelo})</option>)}</SelectField>
                    <SelectField label="Acoplado" name="acopladoDominio" value={formData.acopladoDominio} onChange={handleChange}>{acoplados.map(a => <option key={a.dominio} value={a.dominio}>{a.dominio} ({a.modelo})</option>)}</SelectField>
                    <InputField label="Origen" name="origen" value={formData.origen} onChange={handleChange} />
                    <InputField label="Destino" name="destino" value={formData.destino} onChange={handleChange} />
                    <SelectField label="Estado" name="estado" value={formData.estado} onChange={handleChange}>{estados.map(estado => <option key={estado.id} value={estado.nombre}>{estado.nombre}</option>)}</SelectField>
                    <InputField label="Fecha/Hora Inicio" name="fechaInicio" type="datetime-local" value={formData.fechaInicio} onChange={handleChange} />
                    <InputField label="Fecha/Hora Fin" name="fechaFin" type="datetime-local" value={formData.fechaFin || ''} onChange={handleChange} required={false} />
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                         <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PolizasManager = ({ polizas, camiones, acoplados, onAdd, onUpdate, onDelete }) => {
    const vehiculos = [...camiones, ...acoplados];
    const [formData, setFormData] = useState({ aseguradora: '', asegurado: 'BLSLogistica S.A.', vehiculoDominio: '', inicioVigencia: '', finVigencia: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPoliza, setEditingPoliza] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        alert('Póliza registrada con éxito');
        setFormData({ aseguradora: '', asegurado: 'BLSLogistica S.A.', vehiculoDominio: '', inicioVigencia: '', finVigencia: '' });
    };

    const handleDelete = (id) => { if (window.confirm(`¿Estás seguro de que quieres eliminar esta póliza?`)) onDelete(id); };
    const handleEditClick = (poliza) => { setEditingPoliza(poliza); setIsModalOpen(true); };
    const handleUpdatePoliza = (updatedPoliza) => { onUpdate(updatedPoliza); setIsModalOpen(false); setEditingPoliza(null); };

    const getPolicyStatus = (finVigencia) => {
        const today = new Date();
        const endDate = new Date(finVigencia);
        today.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return endDate >= today ? 'Vigente' : 'Vencida';
    };

    const statusColors = { 'Vigente': 'bg-green-100 text-green-800', 'Vencida': 'bg-red-100 text-red-800' };
    const filteredPolizas = polizas.filter(p => Object.values(p).join(' ').toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Pólizas</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-6">Registrar Nueva Póliza</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Aseguradora" name="aseguradora" value={formData.aseguradora} onChange={handleChange} />
                    <InputField label="Asegurado" name="asegurado" value={formData.asegurado} onChange={handleChange} />
                    <SelectField label="Vehículo" name="vehiculoDominio" value={formData.vehiculoDominio} onChange={handleChange}><option value="">Seleccionar Vehículo</option>{vehiculos.map(v => <option key={v.dominio} value={v.dominio}>{v.dominio} ({v.modelo})</option>)}</SelectField>
                    <InputField label="Inicio de Vigencia" name="inicioVigencia" type="date" value={formData.inicioVigencia} onChange={handleChange} />
                    <InputField label="Fin de Vigencia" name="finVigencia" type="date" value={formData.finVigencia} onChange={handleChange} />
                    <div className="md:col-span-2 flex justify-end">
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">Guardar Póliza</button>
                    </div>
                </form>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Listado de Pólizas</h2>
                    <InputField label="" name="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." required={false} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Aseguradora</th>
                                <th className="p-4 font-semibold text-slate-600">Asegurado</th>
                                <th className="p-4 font-semibold text-slate-600">Vehículo</th>
                                <th className="p-4 font-semibold text-slate-600">Vigencia</th>
                                <th className="p-4 font-semibold text-slate-600">Estado</th>
                                <th className="p-4 font-semibold text-slate-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPolizas.map((poliza) => (
                                <tr key={poliza.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">{poliza.aseguradora}</td>
                                    <td className="p-4">{poliza.asegurado}</td>
                                    <td className="p-4 font-mono">{poliza.vehiculoDominio}</td>
                                    <td className="p-4 text-sm">{new Date(poliza.inicioVigencia).toLocaleDateString()} - {new Date(poliza.finVigencia).toLocaleDateString()}</td>
                                    <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[getPolicyStatus(poliza.finVigencia)]}`}>{getPolicyStatus(poliza.finVigencia)}</span></td>
                                    <td className="p-4 flex items-center gap-2">
                                        <button onClick={() => handleEditClick(poliza)} className="text-slate-500 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-100" title="Editar"><EditIcon /></button>
                                        <button onClick={() => handleDelete(poliza.id)} className="text-slate-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100" title="Borrar"><DeleteIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <EditPolizaModal poliza={editingPoliza} vehiculos={vehiculos} onClose={() => setIsModalOpen(false)} onSave={handleUpdatePoliza} />}
        </div>
    );
};

const EditPolizaModal = ({ poliza, vehiculos, onClose, onSave }) => {
    const [formData, setFormData] = useState(poliza);
    useEffect(() => { setFormData(poliza); }, [poliza]);
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); if (window.confirm('¿Estás seguro?')) onSave(formData); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Editar Póliza</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Aseguradora" name="aseguradora" value={formData.aseguradora} onChange={handleChange} />
                    <InputField label="Asegurado" name="asegurado" value={formData.asegurado} onChange={handleChange} />
                    <SelectField label="Vehículo" name="vehiculoDominio" value={formData.vehiculoDominio} onChange={handleChange}><option value="">Seleccionar</option>{vehiculos.map(v => <option key={v.dominio} value={v.dominio}>{v.dominio} ({v.modelo})</option>)}</SelectField>
                    <InputField label="Inicio Vigencia" name="inicioVigencia" type="date" value={formData.inicioVigencia} onChange={handleChange} />
                    <InputField label="Fin Vigencia" name="finVigencia" type="date" value={formData.finVigencia} onChange={handleChange} />
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const GastosManager = ({ gastos, tiposDeGasto, currencies, viajes, onAddGasto, onUpdateGasto, onDeleteGasto }) => {
    const [formData, setFormData] = useState({ viajeId: '', tipoId: '', monto: '', moneda: 'PYG', fecha: '', descripcion: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [editingGasto, setEditingGasto] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const newGasto = { 
            viajeId: Number(formData.viajeId), 
            tipoId: Number(formData.tipoId), 
            monto: Number(formData.monto) || 0,
            moneda: formData.moneda,
            fecha: formData.fecha,
            descripcion: formData.descripcion,
        };
        onAddGasto(newGasto);
        alert('Gasto registrado con éxito');
        setFormData({ viajeId: '', tipoId: '', monto: '', moneda: 'PYG', fecha: '', descripcion: '' });
    };

    const handleDelete = (gasto) => {
        if (window.confirm(`¿Seguro que quieres eliminar el gasto "${gasto.descripcion || getTipoNombre(gasto.tipoId)}"?`)) onDeleteGasto(gasto.id);
    };

    const handleEditClick = (gasto) => { setEditingGasto(gasto); setIsModalOpen(true); };
    const handleUpdateGasto = (updatedGasto) => { onUpdateGasto(updatedGasto); setIsModalOpen(false); setEditingGasto(null); };

    const getTipoNombre = (tipoId) => tiposDeGasto.find(t => t.id === tipoId)?.nombre || 'N/A';
    const getViajeDesc = (viajeId) => {
        const viaje = viajes.find(v => v.id === viajeId);
        return viaje ? `${viaje.origen} → ${viaje.destino}` : 'N/A';
    };

    const filteredGastos = gastos.filter(g => {
        const search = searchTerm.toLowerCase();
        return getTipoNombre(g.tipoId).toLowerCase().includes(search) || getViajeDesc(g.viajeId).toLowerCase().includes(search) || (g.descripcion || '').toLowerCase().includes(search);
    });

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Gastos</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-6">Registrar Nuevo Gasto</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Viaje" name="viajeId" value={formData.viajeId} onChange={handleChange}><option value="">Seleccionar</option>{viajes.map(v => <option key={v.id} value={v.id}>{getViajeDesc(v.id)} ({new Date(v.fechaInicio).toLocaleDateString()})</option>)}</SelectField>
                    <SelectField label="Tipo de Gasto" name="tipoId" value={formData.tipoId} onChange={handleChange}><option value="">Seleccionar</option>{tiposDeGasto.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}</SelectField>
                    <SelectField label="Moneda" name="moneda" value={formData.moneda} onChange={handleChange}>{currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}</SelectField>
                    <InputField label="Monto" name="monto" type="number" value={formData.monto} onChange={handleChange} />
                    <InputField label="Fecha y Hora" name="fecha" type="datetime-local" value={formData.fecha} onChange={handleChange} className="md:col-span-2" />
                    <div className="md:col-span-2">
                       <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                        <textarea name="descripcion" id="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">Guardar Gasto</button>
                    </div>
                </form>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Listado de Gastos</h2>
                    <InputField label="" name="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." required={false} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Viaje</th>
                                <th className="p-4 font-semibold text-slate-600">Tipo</th>
                                <th className="p-4 font-semibold text-slate-600 text-right">Monto</th>
                                <th className="p-4 font-semibold text-slate-600">Fecha</th>
                                <th className="p-4 font-semibold text-slate-600">Descripción</th>
                                <th className="p-4 font-semibold text-slate-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGastos.map(gasto => (
                                <tr key={gasto.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">{getViajeDesc(gasto.viajeId)}</td>
                                    <td className="p-4">{getTipoNombre(gasto.tipoId)}</td>
                                    <td className="p-4 font-mono text-right">{formatCurrency(gasto.monto, gasto.moneda)}</td>
                                    <td className="p-4">{gasto.fecha ? new Date(gasto.fecha).toLocaleString() : 'N/A'}</td>
                                    <td className="p-4">{gasto.descripcion}</td>
                                    <td className="p-4 flex items-center gap-2">
                                        <button onClick={() => handleEditClick(gasto)} className="text-slate-500 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-100" title="Editar"><EditIcon /></button>
                                        <button onClick={() => handleDelete(gasto)} className="text-slate-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100" title="Borrar"><DeleteIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <EditGastoModal gasto={editingGasto} onClose={() => setIsModalOpen(false)} onSave={handleUpdateGasto} tiposDeGasto={tiposDeGasto} viajes={viajes} currencies={currencies} />}
        </div>
    );
};

const EditGastoModal = ({ gasto, onClose, onSave, tiposDeGasto, viajes, currencies }) => {
    // FIX: Explicitly define the state shape to avoid type conflicts caused by spreading `gasto`
    // and then overwriting properties with different types (e.g., number to string).
    const [formData, setFormData] = useState({ 
        id: gasto.id,
        viajeId: String(gasto.viajeId),
        tipoId: String(gasto.tipoId),
        monto: String(gasto.monto),
        moneda: gasto.moneda,
        fecha: formatDateTimeLocal(gasto.fecha),
        descripcion: gasto.descripcion || '',
    });
    useEffect(() => { setFormData({ 
        id: gasto.id,
        viajeId: String(gasto.viajeId),
        tipoId: String(gasto.tipoId),
        monto: String(gasto.monto),
        moneda: gasto.moneda,
        fecha: formatDateTimeLocal(gasto.fecha),
        descripcion: gasto.descripcion || '',
    }); }, [gasto]);
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const getViajeDesc = (viajeId) => {
        // FIX: Ensure viajeId is compared as a number to avoid type mismatches.
        const viaje = viajes.find(v => v.id === Number(viajeId));
        return viaje ? `${viaje.origen} → ${viaje.destino}` : 'N/A';
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (window.confirm('¿Guardar cambios?')) {
            const updatedGasto = { 
                ...formData, 
                viajeId: Number(formData.viajeId), 
                tipoId: Number(formData.tipoId), 
                monto: Number(formData.monto) || 0 
            };
            onSave(updatedGasto);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Editar Gasto</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Viaje" name="viajeId" value={formData.viajeId} onChange={handleChange}>{viajes.map(v => <option key={v.id} value={v.id}>{getViajeDesc(v.id)}</option>)}</SelectField>
                    <SelectField label="Tipo de Gasto" name="tipoId" value={formData.tipoId} onChange={handleChange}>{tiposDeGasto.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}</SelectField>
                    <SelectField label="Moneda" name="moneda" value={formData.moneda} onChange={handleChange}>{currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}</SelectField>
                    <InputField label="Monto" name="monto" type="number" value={formData.monto} onChange={handleChange} />
                    <InputField label="Fecha y Hora" name="fecha" type="datetime-local" value={formData.fecha} onChange={handleChange} className="md:col-span-2" />
                    <div className="md:col-span-2">
                       <label htmlFor="descripcion_modal" className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                        <textarea name="descripcion" id="descripcion_modal" value={formData.descripcion} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InformesManager = ({ viajes }) => {
    const [loading, setLoading] = useState(false);
    const [selectedViaje, setSelectedViaje] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [message, setMessage] = useState('');

    const downloadDatosPermanentes = async () => {
        setLoading(true);
        setMessage('');
        try {
            const response = await fetch('http://127.0.0.1:5001/api/informes/viajes-excel', {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'viaje.xlsx';  // Nombre simple y directo
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setMessage('Archivo descargado exitosamente');
        } catch (error) {
            console.error('Error descargando informe:', error);
            setMessage('Error al descargar el informe');
        }
        setLoading(false);
    };

    const downloadGastosViaje = async () => {
        if (!selectedViaje) {
            setMessage('Seleccioná un viaje');
            return;
        }
        
        setLoading(true);
        setMessage('');
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/informes/gastos-viaje-excel/${selectedViaje}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gastos_viaje_${selectedViaje}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setMessage('Archivo descargado exitosamente');
        } catch (error) {
            console.error('Error descargando informe:', error);
            setMessage('Error al descargar el informe');
        }
        setLoading(false);
    };

    const downloadGastosPeriodo = async () => {
        if (!fechaInicio || !fechaFin) {
            setMessage('Seleccioná fecha de inicio y fin');
            return;
        }
        
        setLoading(true);
        setMessage('');
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/informes/gastos-periodo-excel?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gastos_periodo_${fechaInicio}_${fechaFin}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setMessage('Archivo descargado exitosamente');
        } catch (error) {
            console.error('Error descargando informe:', error);
            setMessage('Error al descargar el informe');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center">
                    <InformesIcon />
                    <span className="ml-3">Informes</span>
                </h2>
                
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Datos Permanentes */}
                    <div className="bg-slate-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Viajes Completos</h3>
                        <p className="text-slate-600 mb-4">Exportar todos los viajes con información completa de chofer, camión y acoplado</p>
                        <button
                            onClick={downloadDatosPermanentes}
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400"
                        >
                            {loading ? 'Generando...' : 'Descargar Excel'}
                        </button>
                    </div>

                    {/* Gastos por Viaje */}
                    <div className="bg-slate-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Gastos por Viaje</h3>
                        <p className="text-slate-600 mb-4">Exportar gastos de un viaje específico</p>
                        <select
                            value={selectedViaje}
                            onChange={(e) => setSelectedViaje(e.target.value)}
                            className="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md"
                        >
                            <option value="">Seleccionar viaje</option>
                            {viajes.map(viaje => (
                                <option key={viaje.id} value={viaje.id}>
                                    {viaje.origen} → {viaje.destino} ({viaje.fechaInicio ? new Date(viaje.fechaInicio).toLocaleDateString() : 'Sin fecha'})
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={downloadGastosViaje}
                            disabled={loading || !selectedViaje}
                            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-slate-400"
                        >
                            {loading ? 'Generando...' : 'Descargar Excel'}
                        </button>
                    </div>

                    {/* Gastos por Período */}
                    <div className="bg-slate-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Gastos por Período</h3>
                        <p className="text-slate-600 mb-4">Exportar gastos entre fechas específicas</p>
                        <div className="space-y-3 mb-4">
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                placeholder="Fecha inicio"
                            />
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                placeholder="Fecha fin"
                            />
                        </div>
                        <button
                            onClick={downloadGastosPeriodo}
                            disabled={loading || !fechaInicio || !fechaFin}
                            className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-700 disabled:bg-slate-400"
                        >
                            {loading ? 'Generando...' : 'Descargar Excel'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ConfiguracionManager = ({ tiposDeGasto, onAddTipo, onDeleteTipo, currencies }) => {
    const [newTipo, setNewTipo] = useState('');

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (newTipo.trim() === '') return alert('El nombre no puede estar vacío.');
        if (onAddTipo(newTipo.trim())) setNewTipo('');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Configuración</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-6">Gestionar Tipos de Gasto</h2>
                    <form onSubmit={handleAddSubmit} className="flex gap-2 mb-6">
                        <InputField label="" name="newTipo" value={newTipo} onChange={e => setNewTipo(e.target.value)} placeholder="Ej: Mantenimiento" />
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700 h-fit self-end">Agregar</button>
                    </form>
                    <h3 className="font-semibold mb-2 text-slate-600">Tipos Existentes</h3>
                    <ul className="space-y-2 max-h-80 overflow-y-auto border-t pt-4">
                        {tiposDeGasto.map(tipo => (
                            <li key={tipo.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-md hover:bg-slate-100">
                                <span className="text-slate-800 font-medium">{tipo.nombre}</span>
                                <button onClick={() => onDeleteTipo(tipo.id)} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-100" title={`Borrar ${tipo.nombre}`}><DeleteIcon /></button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-6">Monedas Soportadas</h2>
                    <p className="text-sm text-slate-500 mb-4">Estas son las monedas disponibles para el registro de gastos.</p>
                    <ul className="space-y-2 border-t pt-4">
                        {currencies.map(currency => (
                            <li key={currency.code} className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
                                <span className="text-slate-800 font-medium">{currency.name}</span>
                                <span className="font-mono text-sm text-slate-500 bg-slate-200 px-2 py-1 rounded">{currency.code}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ label, name, type = 'text', value, onChange, className = '', placeholder = '', required = true }) => (
    <div className={className}>
        {label && <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, className = '', children = null, required = true }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <select
            name={name}
            id={name}
            value={value === null || value === undefined ? '' : value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
            {children}
        </select>
    </div>
);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);