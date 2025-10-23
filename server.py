# server.py

from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
from database import db, init_db, Chofer, Camion, Acoplado, Viaje, Poliza, Gasto, TipoDeGasto, Currency, VehiculoEstado, ViajeEstado
import os
from dateutil.parser import parse as parse_date
import threading
import time

# Simple in-memory status tracker for the reset operation
reset_status = {
    'in_progress': False,
    'started_at': None,
    'finished_at': None,
    'last_error': None,
}
reset_lock = threading.Lock()

# ----------------- App Initialization -----------------
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cargoflow.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False # Mantiene el orden de las claves en la respuesta JSON

# Configurar CORS para permitir que el frontend (en otro dominio/puerto) se comunique con el backend.
CORS(app)

# Inicializar la app con la instancia de la base de datos de database.py
db.init_app(app)

# ----------------- API Endpoints -----------------

# --- Choferes ---
@app.route('/api/choferes', methods=['GET'])
def get_choferes():
    choferes = Chofer.query.all()    
    return jsonify([chofer.to_dict() for chofer in choferes])

@app.route('/api/choferes', methods=['POST'])
def add_chofer():
    data = request.json
    new_chofer = Chofer(**data)
    db.session.add(new_chofer)
    db.session.commit()
    return jsonify(new_chofer.to_dict()), 201

@app.route('/api/choferes/<int:id>', methods=['PUT'])
def update_chofer(id):
    chofer = Chofer.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(chofer, key, value)
    db.session.commit()
    return jsonify(chofer.to_dict())

@app.route('/api/choferes/<int:id>', methods=['DELETE'])
def delete_chofer(id):
    chofer = Chofer.query.get_or_404(id)
    db.session.delete(chofer)
    db.session.commit()
    return jsonify({'message': 'Chofer eliminado'}), 200

# --- Camiones ---
@app.route('/api/camiones', methods=['GET'])
def get_camiones():
    camiones = Camion.query.all()
    return jsonify([camion.to_dict() for camion in camiones])

@app.route('/api/camiones', methods=['POST'])
def add_camion():
    data = request.json
    new_camion = Camion(**data)
    db.session.add(new_camion)
    db.session.commit()
    return jsonify(new_camion.to_dict()), 201

@app.route('/api/camiones/<string:dominio>', methods=['PUT'])
def update_camion(dominio):
    camion = Camion.query.get_or_404(dominio)
    data = request.json
    for key, value in data.items():
        setattr(camion, key, value)
    db.session.commit()
    return jsonify(camion.to_dict())

@app.route('/api/camiones/<string:dominio>', methods=['DELETE'])
def delete_camion(dominio):
    camion = Camion.query.get_or_404(dominio)
    db.session.delete(camion)
    db.session.commit()
    return jsonify({'message': 'Camión eliminado'}), 200

# --- Acoplados ---
@app.route('/api/acoplados', methods=['GET'])
def get_acoplados():
    acoplados = Acoplado.query.all()
    return jsonify([acoplado.to_dict() for acoplado in acoplados])

@app.route('/api/acoplados', methods=['POST'])
def add_acoplado():
    data = request.json
    new_acoplado = Acoplado(**data)
    db.session.add(new_acoplado)
    db.session.commit()
    return jsonify(new_acoplado.to_dict()), 201

@app.route('/api/acoplados/<string:dominio>', methods=['PUT'])
def update_acoplado(dominio):
    acoplado = Acoplado.query.get_or_404(dominio)
    data = request.json
    for key, value in data.items():
        setattr(acoplado, key, value)
    db.session.commit()
    return jsonify(acoplado.to_dict())

@app.route('/api/acoplados/<string:dominio>', methods=['DELETE'])
def delete_acoplado(dominio):
    acoplado = Acoplado.query.get_or_404(dominio)
    db.session.delete(acoplado)
    db.session.commit()
    return jsonify({'message': 'Acoplado eliminado'}), 200

# --- Viajes ---
@app.route('/api/viajes', methods=['GET'])
def get_viajes():
    viajes = Viaje.query.order_by(Viaje.fecha_inicio.desc()).all()
    return jsonify([viaje.to_dict() for viaje in viajes])

@app.route('/api/viajes', methods=['POST'])
def add_viaje():
    data = request.json
    # Asegurarse que los campos vacíos de fecha sean None
    if 'fechaFin' in data and not data['fechaFin']:
        data['fechaFin'] = None
    new_viaje = Viaje(**data)
    db.session.add(new_viaje)
    db.session.commit()
    return jsonify(new_viaje.to_dict()), 201

@app.route('/api/viajes/<int:id>', methods=['PUT'])
def update_viaje(id):
    viaje = Viaje.query.get_or_404(id)
    data = request.json
    if 'fechaFin' in data and not data['fechaFin']:
        data['fechaFin'] = None
    for key, value in data.items():
        setattr(viaje, key, value)
    db.session.commit()
    return jsonify(viaje.to_dict())

@app.route('/api/viajes/<int:id>', methods=['DELETE'])
def delete_viaje(id):
    viaje = Viaje.query.get_or_404(id)
    db.session.delete(viaje)
    db.session.commit()
    return jsonify({'message': 'Viaje eliminado'}), 200

# --- Pólizas ---
@app.route('/api/polizas', methods=['GET'])
def get_polizas():
    polizas = Poliza.query.order_by(Poliza.fin_vigencia.asc()).all()
    return jsonify([poliza.to_dict() for poliza in polizas])

@app.route('/api/polizas', methods=['POST'])
def add_poliza():
    data = request.json
    new_poliza = Poliza(**data)
    db.session.add(new_poliza)
    db.session.commit()
    return jsonify(new_poliza.to_dict()), 201

@app.route('/api/polizas/<int:id>', methods=['PUT'])
def update_poliza(id):
    poliza = Poliza.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(poliza, key, value)
    db.session.commit()
    return jsonify(poliza.to_dict())

@app.route('/api/polizas/<int:id>', methods=['DELETE'])
def delete_poliza(id):
    poliza = Poliza.query.get_or_404(id)
    db.session.delete(poliza)
    db.session.commit()
    return jsonify({'message': 'Póliza eliminada'}), 200

# --- Gastos ---
@app.route('/api/gastos', methods=['GET'])
def get_gastos():
    gastos = Gasto.query.order_by(Gasto.fecha.desc()).all()
    return jsonify([gasto.to_dict() for gasto in gastos])

@app.route('/api/gastos', methods=['POST'])
def add_gasto():
    data = request.json
    # Parsear fecha si viene como ISO string desde el frontend
    if 'fecha' in data and data['fecha']:
        try:
            data['fecha'] = parse_date(data['fecha'])
        except Exception:
            data['fecha'] = None
    else:
        data['fecha'] = None
    new_gasto = Gasto(**data)
    db.session.add(new_gasto)
    db.session.commit()
    return jsonify(new_gasto.to_dict()), 201

@app.route('/api/gastos/<int:id>', methods=['PUT'])
def update_gasto(id):
    gasto = Gasto.query.get_or_404(id)
    data = request.json
    # Aceptar fecha como ISO string y parsearla
    if 'fecha' in data:
        if data['fecha']:
            try:
                data['fecha'] = parse_date(data['fecha'])
            except Exception:
                data['fecha'] = None
        else:
            data['fecha'] = None
    for key, value in data.items():
        setattr(gasto, key, value)
    db.session.commit()
    return jsonify(gasto.to_dict())

@app.route('/api/gastos/<int:id>', methods=['DELETE'])
def delete_gasto(id):
    gasto = Gasto.query.get_or_404(id)
    db.session.delete(gasto)
    db.session.commit()
    return jsonify({'message': 'Gasto eliminado'}), 200
    
# --- Tipos de Gasto ---
@app.route('/api/tiposDeGasto', methods=['GET'])
def get_tipos_de_gasto():
    tipos = TipoDeGasto.query.order_by(TipoDeGasto.nombre).all()
    return jsonify([t.to_dict() for t in tipos])

@app.route('/api/tiposDeGasto', methods=['POST'])
def add_tipo_de_gasto():
    data = request.json
    new_tipo = TipoDeGasto(**data)
    db.session.add(new_tipo)
    db.session.commit()
    return jsonify(new_tipo.to_dict()), 201
    
@app.route('/api/tiposDeGasto/<int:id>', methods=['DELETE'])
def delete_tipo_de_gasto(id):
    tipo = TipoDeGasto.query.get_or_404(id)
    db.session.delete(tipo)
    db.session.commit()
    return jsonify({'message': 'Tipo de gasto eliminado'}), 200

# --- Lookups (Read-only) ---
@app.route('/api/currencies', methods=['GET'])
def get_currencies():
    currencies = Currency.query.all()
    return jsonify([c.to_dict() for c in currencies])

@app.route('/api/vehiculoEstados', methods=['GET'])
def get_vehiculo_estados():
    estados = VehiculoEstado.query.all()
    return jsonify([e.to_dict() for e in estados])

@app.route('/api/viajeEstados', methods=['GET'])
def get_viaje_estados():
    estados = ViajeEstado.query.all()
    return jsonify([e.to_dict() for e in estados])

    # --- Admin: reset database (drops all tables, recreates and seeds) ---
@app.route('/api/reset', methods=['POST'])
def reset_database():
    """Reset the entire database to initial seeded state.
    This will drop all tables, recreate them and call init_db() to populate
    lookups and sample data. Intended for development/testing only.
    """
    # If a reset is already running, inform the client
    with reset_lock:
        if reset_status['in_progress']:
            return jsonify({'message': 'Reset already in progress'}), 202
        # mark as started
        reset_status['in_progress'] = True
        reset_status['started_at'] = time.strftime('%Y-%m-%dT%H:%M:%S')
        reset_status['finished_at'] = None
        reset_status['last_error'] = None

    def _perform_reset():
        with app.app_context():
            try:
                db.session.close()
                db.drop_all()
                db.create_all()
                init_db()
                with reset_lock:
                    reset_status['last_error'] = None
                    reset_status['finished_at'] = time.strftime('%Y-%m-%dT%H:%M:%S')
                    reset_status['in_progress'] = False
            except Exception as e:
                # rollback to keep DB consistent and record error
                try:
                    db.session.rollback()
                except Exception:
                    pass
                with reset_lock:
                    reset_status['last_error'] = str(e)
                    reset_status['finished_at'] = time.strftime('%Y-%m-%dT%H:%M:%S')
                    reset_status['in_progress'] = False

    # Start reset in a background thread (daemon so it won't block shutdown)
    t = threading.Thread(target=_perform_reset, daemon=True)
    t.start()
    return jsonify({'message': 'Reset started'}), 202



@app.route('/api/reset/status', methods=['GET'])
def get_reset_status():
    with reset_lock:
        return jsonify(reset_status), 200


# --- Informes ---
@app.route('/api/informes/viajes-excel', methods=['GET'])
def informe_datos_permanentes_excel():
    """Genera un archivo Excel con datos de viajes y su información asociada (chofer, camión, acoplado)"""
    try:
        import pandas as pd
        from io import BytesIO
        from flask import send_file
        
        # Obtener viajes con información relacionada
        viajes_query = db.session.query(
            Viaje.id.label('viaje_id'),
            Viaje.origen,
            Viaje.destino,
            Viaje.fecha_inicio,
            Viaje.fecha_fin,
            Viaje.estado.label('viaje_estado'),
            # Datos del chofer
            Chofer.id.label('chofer_id'),
            Chofer.nombre.label('chofer_nombre'),
            Chofer.apellido.label('chofer_apellido'),
            Chofer.nacionalidad.label('chofer_nacionalidad'),
            Chofer.identificacion.label('chofer_identificacion'),
            Chofer.identificacion_laboral.label('chofer_identificacion_laboral'),
            Chofer.telefono.label('chofer_telefono'),
            Chofer.email.label('chofer_email'),
            # Datos del camión
            Camion.dominio.label('camion_dominio'),
            Camion.marca.label('camion_marca'),
            Camion.modelo.label('camion_modelo'),
            Camion.año.label('camion_año'),
            Camion.color.label('camion_color'),
            Camion.tipo.label('camion_tipo'),
            Camion.chasis.label('camion_chasis'),
            Camion.estado.label('camion_estado'),
            # Datos del acoplado
            Acoplado.dominio.label('acoplado_dominio'),
            Acoplado.marca.label('acoplado_marca'),
            Acoplado.modelo.label('acoplado_modelo'),
            Acoplado.año.label('acoplado_año'),
            Acoplado.color.label('acoplado_color'),
            Acoplado.tipo.label('acoplado_tipo'),
            Acoplado.chasis.label('acoplado_chasis'),
            Acoplado.estado.label('acoplado_estado')
        ).outerjoin(Chofer, Viaje.chofer_id == Chofer.id
        ).outerjoin(Camion, Viaje.camion_dominio == Camion.dominio
        ).outerjoin(Acoplado, Viaje.acoplado_dominio == Acoplado.dominio
        ).order_by(Viaje.fecha_inicio.asc()).all()
        
        if not viajes_query:
            return jsonify({'error': 'No se encontraron viajes para generar el informe'}), 404
        
        # Convertir a lista de diccionarios
        viajes_data = []
        for row in viajes_query:
            viajes_data.append({
                # Información del viaje
                'ID Viaje': row.viaje_id,
                'Origen': row.origen,
                'Destino': row.destino,
                'Fecha Inicio': row.fecha_inicio.strftime('%Y-%m-%d %H:%M:%S') if row.fecha_inicio else '',
                'Fecha Fin': row.fecha_fin.strftime('%Y-%m-%d %H:%M:%S') if row.fecha_fin else '',
                
                # Información del chofer
                'Chofer Nombre': row.chofer_nombre or '',
                'Chofer Apellido': row.chofer_apellido or '',
                'Chofer Nacionalidad': row.chofer_nacionalidad or '',
                'Chofer Identificación': row.chofer_identificacion or '',
                'Chofer ID Laboral': row.chofer_identificacion_laboral or '',
                'Chofer Teléfono': row.chofer_telefono or '',
                'Chofer Email': row.chofer_email or '',
                
                # Información del camión
                'Camión Dominio': row.camion_dominio or '',
                'Camión Marca': row.camion_marca or '',
                'Camión Modelo': row.camion_modelo or '',
                'Camión Año': row.camion_año or '',
                'Camión Color': row.camion_color or '',
                'Camión Tipo': row.camion_tipo or '',
                'Camión Chasis': row.camion_chasis or '',
                
                # Información del acoplado
                'Acoplado Dominio': row.acoplado_dominio or '',
                'Acoplado Marca': row.acoplado_marca or '',
                'Acoplado Modelo': row.acoplado_modelo or '',
                'Acoplado Año': row.acoplado_año or '',
                'Acoplado Color': row.acoplado_color or '',
                'Acoplado Tipo': row.acoplado_tipo or '',
                'Acoplado Chasis': row.acoplado_chasis or ''
            })
        
        # Convertir a DataFrame
        df_viajes = pd.DataFrame(viajes_data)
        
        # Crear archivo Excel en memoria
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_viajes.to_excel(writer, sheet_name='Viajes', index=False)
            
            # Añadir hoja de resumen
            resumen_data = {
                'Concepto': [
                    'Total Viajes',
                    'Viajes con Chofer Asignado',
                    'Viajes con Camión Asignado',
                    'Viajes con Acoplado Asignado',
                    'Viajes (con todos los datos)'
                ],
                'Cantidad': [
                    len(viajes_data),
                    len([v for v in viajes_data if v['Chofer Nombre']]),
                    len([v for v in viajes_data if v['Camión Dominio']]),
                    len([v for v in viajes_data if v['Acoplado Dominio']]),
                    len([v for v in viajes_data if v['Chofer Nombre'] and v['Camión Dominio'] and v['Acoplado Dominio']])
                ]
            }
            df_resumen = pd.DataFrame(resumen_data)
            df_resumen.to_excel(writer, sheet_name='Resumen', index=False)
        
        output.seek(0)
        
        filename = f'viaje_{time.strftime("%Y%m%d_%H%M%S")}.xlsx'
        
        response = make_response(send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        ))
        
        # Agregar headers para evitar caché
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        return response
        
    except Exception as e:
        return jsonify({'error': f'Error generando informe: {str(e)}'}), 500

@app.route('/api/informes/gastos-viaje-excel/<int:viaje_id>', methods=['GET'])
def informe_gastos_viaje_excel(viaje_id):
    """Genera un archivo Excel con los gastos de un viaje específico"""
    try:
        import pandas as pd
        from io import BytesIO
        from flask import send_file
        
        # Verificar que el viaje existe
        viaje = Viaje.query.get_or_404(viaje_id)
        
        # Obtener gastos del viaje con información adicional
        gastos_query = db.session.query(
            Gasto.id,
            Gasto.monto,
            Gasto.fecha,
            Gasto.descripcion,
            Gasto.moneda,
            TipoDeGasto.nombre.label('tipo_gasto'),
            Viaje.origen,
            Viaje.destino,
            Chofer.nombre.label('chofer_nombre'),
            Chofer.apellido.label('chofer_apellido'),
            Camion.dominio.label('camion_dominio'),
            Camion.marca.label('camion_marca'),
            Camion.modelo.label('camion_modelo'),
            Acoplado.dominio.label('acoplado_dominio'),
            Acoplado.marca.label('acoplado_marca'),
            Acoplado.modelo.label('acoplado_modelo')
        ).join(TipoDeGasto, Gasto.tipo_id == TipoDeGasto.id
        ).join(Viaje, Gasto.viaje_id == Viaje.id
        ).outerjoin(Chofer, Viaje.chofer_id == Chofer.id
        ).outerjoin(Camion, Viaje.camion_dominio == Camion.dominio
        ).outerjoin(Acoplado, Viaje.acoplado_dominio == Acoplado.dominio
        ).filter(Gasto.viaje_id == viaje_id).all()
        
        if not gastos_query:
            return jsonify({'error': 'No se encontraron gastos para este viaje'}), 404
        
        # Convertir a DataFrame
        gastos_data = []
        for row in gastos_query:
            gastos_data.append({
                'ID Gasto': row.id,
                'Fecha': row.fecha.strftime('%Y-%m-%d %H:%M:%S') if row.fecha else '',
                'Tipo de Gasto': row.tipo_gasto,
                'Descripción': row.descripcion or '',
                'Monto': row.monto,
                'Moneda': row.moneda,
                'Viaje - Origen': row.origen,
                'Viaje - Destino': row.destino,
                'Chofer': f"{row.chofer_nombre or ''} {row.chofer_apellido or ''}".strip(),
                'Camión': f"{row.camion_dominio or ''} - {row.camion_marca or ''} {row.camion_modelo or ''}".strip(),
                'Acoplado': f"{row.acoplado_dominio or ''} - {row.acoplado_marca or ''} {row.acoplado_modelo or ''}".strip()
            })
        
        df_gastos = pd.DataFrame(gastos_data)
        
        # Crear archivo Excel en memoria
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_gastos.to_excel(writer, sheet_name='Gastos del Viaje', index=False)
            
            # Añadir hoja de resumen
            resumen_data = {
                'Concepto': ['Viaje ID', 'Origen', 'Destino', 'Total Gastos', 'Cantidad de Gastos'],
                'Valor': [
                    viaje_id,
                    viaje.origen,
                    viaje.destino,
                    len(gastos_data),
                    f"{sum([g['Monto'] for g in gastos_data]):.2f}"
                ]
            }
            df_resumen = pd.DataFrame(resumen_data)
            df_resumen.to_excel(writer, sheet_name='Resumen', index=False)
        
        output.seek(0)
        
        filename = f'Gastos por Viaje_{viaje_id}_{time.strftime("%Y%m%d_%H%M%S")}.xlsx'
        
        response = make_response(send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        ))
        
        # Agregar headers para evitar caché
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        return response
        
    except Exception as e:
        return jsonify({'error': f'Error generando informe: {str(e)}'}), 500

@app.route('/api/informes/gastos-periodo-excel', methods=['GET'])
def informe_gastos_periodo_excel():
    """Genera un archivo Excel con gastos de un período específico"""
    try:
        import pandas as pd
        from io import BytesIO
        from flask import send_file
        from datetime import datetime
        
        # Obtener parámetros de fecha
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        
        if not fecha_inicio or not fecha_fin:
            return jsonify({'error': 'Se requieren fecha_inicio y fecha_fin como parámetros'}), 400
        
        try:
            fecha_inicio_dt = parse_date(fecha_inicio)
            fecha_fin_dt = parse_date(fecha_fin)
        except:
            return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
        
        # Obtener gastos del período
        gastos_query = db.session.query(
            Gasto.id,
            Gasto.monto,
            Gasto.fecha,
            Gasto.descripcion,
            Gasto.moneda,
            TipoDeGasto.nombre.label('tipo_gasto'),
            Viaje.id.label('viaje_id'),
            Viaje.origen,
            Viaje.destino,
            Chofer.nombre.label('chofer_nombre'),
            Chofer.apellido.label('chofer_apellido')
        ).join(TipoDeGasto, Gasto.tipo_id == TipoDeGasto.id
        ).join(Viaje, Gasto.viaje_id == Viaje.id
        ).outerjoin(Chofer, Viaje.chofer_id == Chofer.id
        ).filter(
            Gasto.fecha >= fecha_inicio_dt,
            Gasto.fecha <= fecha_fin_dt
        ).order_by(Gasto.fecha.desc()).all()
        
        if not gastos_query:
            return jsonify({'error': f'No se encontraron gastos entre {fecha_inicio} y {fecha_fin}'}), 404
        
        # Convertir a DataFrame
        gastos_data = []
        for row in gastos_query:
            gastos_data.append({
                'ID Gasto': row.id,
                'Fecha': row.fecha.strftime('%Y-%m-%d %H:%M:%S') if row.fecha else '',
                'Tipo de Gasto': row.tipo_gasto,
                'Descripción': row.descripcion or '',
                'Monto': row.monto,
                'Moneda': row.moneda,
                'ID Viaje': row.viaje_id,
                'Origen': row.origen,
                'Destino': row.destino,
                'Chofer': f"{row.chofer_nombre or ''} {row.chofer_apellido or ''}".strip()
            })
        
        df_gastos = pd.DataFrame(gastos_data)
        
        # Crear archivo Excel en memoria
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_gastos.to_excel(writer, sheet_name='Gastos por Período', index=False)
            
            # Añadir hoja de resumen por tipo de gasto
            resumen_por_tipo = df_gastos.groupby('Tipo de Gasto')['Monto'].agg(['count', 'sum']).reset_index()
            resumen_por_tipo.columns = ['Tipo de Gasto', 'Cantidad', 'Total']
            resumen_por_tipo.to_excel(writer, sheet_name='Resumen por Tipo', index=False)
            
            # Añadir hoja de resumen por moneda
            resumen_por_moneda = df_gastos.groupby('Moneda')['Monto'].agg(['count', 'sum']).reset_index()
            resumen_por_moneda.columns = ['Moneda', 'Cantidad', 'Total']
            resumen_por_moneda.to_excel(writer, sheet_name='Resumen por Moneda', index=False)
        
        output.seek(0)
        
        filename = f'Gastos por Periodo_{fecha_inicio}_{fecha_fin}_{time.strftime("%Y%m%d_%H%M%S")}.xlsx'
        
        response = make_response(send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        ))
        
        # Agregar headers para evitar caché
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        return response
        
    except Exception as e:
        return jsonify({'error': f'Error generando informe: {str(e)}'}), 500


# ----------------- Main Execution -----------------
if __name__ == '__main__':
    # Usar el contexto de la aplicación para interactuar con la base de datos
    with app.app_context():
        # Si el archivo de la base de datos no existe, créalo y llena los datos iniciales.
        if not os.path.exists('cargoflow.db'):
            print("Base de datos no encontrada. Creando y poblando con datos iniciales...")
            db.create_all()
            init_db()
            print("Base de datos creada y poblada exitosamente.")
    
    # Iniciar el servidor de desarrollo de Flask
    app.run(host='0.0.0.0', port=5001, debug=True)