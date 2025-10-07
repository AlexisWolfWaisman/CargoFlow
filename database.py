# database.py

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from dateutil.parser import parse as parse_date

# Inicializar la instancia de SQLAlchemy.
# Esta instancia se conectará a la aplicación Flask en server.py.
db = SQLAlchemy()

# ----------------------------------------
# --- Modelos de la Base de Datos ---
# ----------------------------------------
# Cada clase representa una tabla en la base de datos.
# Los nombres de los campos con guion bajo (ej: fecha_inicio) se mapean
# a camelCase (ej: fechaInicio) para ser compatibles con el frontend.
# El método to_dict() convierte un objeto del modelo a un diccionario
# para poder enviarlo como JSON a través de la API.

class Chofer(db.Model):
    __tablename__ = 'choferes'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    apellido = db.Column(db.String(255), nullable=False)
    nacionalidad = db.Column(db.String(100))
    identificacion = db.Column(db.String(100), nullable=False, unique=True)
    identificacion_laboral = db.Column(db.String(100))
    telefono = db.Column(db.String(50))
    email = db.Column(db.String(255))

    @property
    def identificacionLaboral(self):
        return self.identificacion_laboral
    @identificacionLaboral.setter
    def identificacionLaboral(self, value):
        self.identificacion_laboral = value

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'nacionalidad': self.nacionalidad,
            'identificacion': self.identificacion,
            'identificacionLaboral': self.identificacion_laboral,
            'telefono': self.telefono,
            'email': self.email,
        }

class VehiculoEstado(db.Model):
    __tablename__ = 'vehiculo_estados'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False, unique=True)
    def to_dict(self):
        return {'id': self.id, 'nombre': self.nombre}

class ViajeEstado(db.Model):
    __tablename__ = 'viaje_estados'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False, unique=True)
    def to_dict(self):
        return {'id': self.id, 'nombre': self.nombre}

class Camion(db.Model):
    __tablename__ = 'camiones'
    dominio = db.Column(db.String(20), primary_key=True)
    marca = db.Column(db.String(100))
    modelo = db.Column(db.String(100), nullable=False)
    año = db.Column(db.Integer)
    color = db.Column(db.String(50))
    tipo = db.Column(db.String(100))
    chasis = db.Column(db.String(100), unique=True)
    foto = db.Column(db.Text)
    estado = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            'dominio': self.dominio, 'marca': self.marca, 'modelo': self.modelo,
            'año': self.año, 'color': self.color, 'tipo': self.tipo,
            'chasis': self.chasis, 'foto': self.foto, 'estado': self.estado
        }

class Acoplado(db.Model):
    __tablename__ = 'acoplados'
    dominio = db.Column(db.String(20), primary_key=True)
    marca = db.Column(db.String(100))
    modelo = db.Column(db.String(100), nullable=False)
    año = db.Column(db.Integer)
    color = db.Column(db.String(50))
    tipo = db.Column(db.String(100))
    chasis = db.Column(db.String(100), unique=True)
    estado = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            'dominio': self.dominio, 'marca': self.marca, 'modelo': self.modelo,
            'año': self.año, 'color': self.color, 'tipo': self.tipo,
            'chasis': self.chasis, 'estado': self.estado
        }

class Viaje(db.Model):
    __tablename__ = 'viajes'
    id = db.Column(db.Integer, primary_key=True)
    origen = db.Column(db.String(255), nullable=False)
    destino = db.Column(db.String(255), nullable=False)
    fecha_inicio = db.Column(db.DateTime)
    fecha_fin = db.Column(db.DateTime, nullable=True)
    chofer_id = db.Column(db.Integer, db.ForeignKey('choferes.id'))
    camion_dominio = db.Column(db.String(20), db.ForeignKey('camiones.dominio'))
    acoplado_dominio = db.Column(db.String(20), db.ForeignKey('acoplados.dominio'))
    estado = db.Column(db.String(50))

    @property
    def fechaInicio(self): return self.fecha_inicio
    @fechaInicio.setter
    def fechaInicio(self, value): self.fecha_inicio = parse_date(value) if isinstance(value, str) else value

    @property
    def fechaFin(self): return self.fecha_fin
    @fechaFin.setter
    def fechaFin(self, value): self.fecha_fin = parse_date(value) if value and isinstance(value, str) else None

    @property
    def choferId(self): return self.chofer_id
    @choferId.setter
    def choferId(self, value): self.chofer_id = value

    @property
    def camionDominio(self): return self.camion_dominio
    @camionDominio.setter
    def camionDominio(self, value): self.camion_dominio = value

    @property
    def acopladoDominio(self): return self.acoplado_dominio
    @acopladoDominio.setter
    def acopladoDominio(self, value): self.acoplado_dominio = value

    def to_dict(self):
        return {
            'id': self.id, 'origen': self.origen, 'destino': self.destino,
            'fechaInicio': self.fecha_inicio.isoformat() if self.fecha_inicio else None,
            'fechaFin': self.fecha_fin.isoformat() if self.fecha_fin else None,
            'choferId': self.chofer_id, 'camionDominio': self.camion_dominio,
            'acopladoDominio': self.acoplado_dominio, 'estado': self.estado
        }

class Poliza(db.Model):
    __tablename__ = 'polizas'
    id = db.Column(db.Integer, primary_key=True)
    aseguradora = db.Column(db.String(255), nullable=False)
    asegurado = db.Column(db.String(255))
    vehiculo_dominio = db.Column(db.String(20), nullable=False)
    inicio_vigencia = db.Column(db.Date)
    fin_vigencia = db.Column(db.Date)

    @property
    def vehiculoDominio(self): return self.vehiculo_dominio
    @vehiculoDominio.setter
    def vehiculoDominio(self, value): self.vehiculo_dominio = value

    @property
    def inicioVigencia(self): return self.inicio_vigencia
    @inicioVigencia.setter
    def inicioVigencia(self, value): self.inicio_vigencia = parse_date(value).date() if isinstance(value, str) else value

    @property
    def finVigencia(self): return self.fin_vigencia
    @finVigencia.setter
    def finVigencia(self, value): self.fin_vigencia = parse_date(value).date() if isinstance(value, str) else value

    def to_dict(self):
        return {
            'id': self.id, 'aseguradora': self.aseguradora, 'asegurado': self.asegurado,
            'vehiculoDominio': self.vehiculo_dominio,
            'inicioVigencia': self.inicio_vigencia.isoformat() if self.inicio_vigencia else None,
            'finVigencia': self.fin_vigencia.isoformat() if self.fin_vigencia else None,
        }

class Currency(db.Model):
    __tablename__ = 'currencies'
    code = db.Column(db.String(3), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    def to_dict(self):
        return {'code': self.code, 'name': self.name}

class TipoDeGasto(db.Model):
    __tablename__ = 'tipos_de_gasto'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    def to_dict(self):
        return {'id': self.id, 'nombre': self.nombre}

class Gasto(db.Model):
    __tablename__ = 'gastos'
    id = db.Column(db.Integer, primary_key=True)
    monto = db.Column(db.Float, nullable=False)
    fecha = db.Column(db.DateTime)
    descripcion = db.Column(db.Text)
    viaje_id = db.Column(db.Integer, db.ForeignKey('viajes.id'), nullable=False)
    tipo_id = db.Column(db.Integer, db.ForeignKey('tipos_de_gasto.id'), nullable=False)
    moneda = db.Column(db.String(3), db.ForeignKey('currencies.code'), nullable=False)

    @property
    def viajeId(self): return self.viaje_id
    @viajeId.setter
    def viajeId(self, value): self.viaje_id = value

    @property
    def tipoId(self): return self.tipo_id
    @tipoId.setter
    def tipoId(self, value): self.tipo_id = value
    
    # This property setter is overriding the column name, which is not ideal.
    # The original "fecha" property is kept for direct access, and a setter
    # is provided for the camelCase version from the frontend.
    @property
    def fecha_prop(self): return self.fecha
    @fecha_prop.setter
    def fecha_prop(self, value): self.fecha = parse_date(value) if isinstance(value, str) else value

    def to_dict(self):
        return {
            'id': self.id, 
            'monto': self.monto,
            'fecha': self.fecha.isoformat() if self.fecha else None,
            'descripcion': self.descripcion, 
            'viajeId': self.viaje_id,
            'tipoId': self.tipo_id, 
            'moneda': self.moneda,
        }


def init_db():
    """Populate the database with initial lookup data and a few sample records.
    This function is safe to call multiple times; it checks counts before inserting.
    """
    from datetime import date, timedelta
    # --- Lookups ---
    if VehiculoEstado.query.count() == 0:
        estados = ['Disponible', 'En Viaje', 'En Mantenimiento']
        for nombre in estados:
            db.session.add(VehiculoEstado(nombre=nombre))

    if ViajeEstado.query.count() == 0:
        estados_v = ['Programado', 'En Curso', 'Finalizado', 'Cancelado']
        for nombre in estados_v:
            db.session.add(ViajeEstado(nombre=nombre))

    if Currency.query.count() == 0:
        db.session.add(Currency(code='PYG', name='Guaraní'))
        db.session.add(Currency(code='USD', name='Dólar'))

    if TipoDeGasto.query.count() == 0:
        for nombre in ['Combustible', 'Peaje', 'Mantenimiento']:
            db.session.add(TipoDeGasto(nombre=nombre))

    db.session.commit()

    # --- Sample domain data ---
    try:
        if Chofer.query.count() == 0:
            chofer = Chofer(nombre='Juan', apellido='Pérez', nacionalidad='PY', identificacion='12345678', identificacion_laboral='LAB123', telefono='+595981234567', email='juan.perez@example.com')
            db.session.add(chofer)
        else:
            chofer = Chofer.query.first()

        if Camion.query.count() == 0:
            camion = Camion(dominio='ABC123', marca='Scania', modelo='R450', color='Rojo', tipo='Tractor', chasis='CH123456', foto=None, estado='Disponible')
            # asignar año usando setattr para evitar problemas con identificadores no-ASCII en kwargs
            setattr(camion, 'año', 2022)
            db.session.add(camion)
        else:
            camion = Camion.query.first()

        if Acoplado.query.count() == 0:
            acoplado = Acoplado(dominio='ACP321', marca='Schmitz', modelo='S1', color='Negro', tipo='Caja', chasis='AC123456', estado='Disponible')
            setattr(acoplado, 'año', 2020)
            db.session.add(acoplado)
        else:
            acoplado = Acoplado.query.first()

        db.session.commit()

        if Viaje.query.count() == 0:
            viaje = Viaje(origen='Asunción', destino='Encarnación', fecha_inicio=datetime.now(), fecha_fin=None, chofer_id=chofer.id, camion_dominio=camion.dominio, acoplado_dominio=acoplado.dominio, estado='Programado')
            db.session.add(viaje)
            db.session.commit()
        else:
            viaje = Viaje.query.first()

        if Poliza.query.count() == 0:
            inicio = date.today()
            fin = inicio + timedelta(days=90)
            pol = Poliza(aseguradora='Seguros S.A.', asegurado='BLSLogistica S.A.', vehiculo_dominio=camion.dominio, inicio_vigencia=inicio, fin_vigencia=fin)
            db.session.add(pol)

        db.session.commit()

        if Gasto.query.count() == 0:
            tipo = TipoDeGasto.query.first()
            currency = Currency.query.first()
            gasto = Gasto(monto=150000.0, fecha=datetime.now(), descripcion='Carga de combustible inicial', viaje_id=viaje.id, tipo_id=tipo.id, moneda=currency.code)
            db.session.add(gasto)
        db.session.commit()
    except Exception:
        # If seeding fails, rollback to keep DB consistent
        db.session.rollback()