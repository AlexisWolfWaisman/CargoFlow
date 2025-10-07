# server.py

from flask import Flask, request, jsonify
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