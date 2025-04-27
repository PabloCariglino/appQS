package com.QS.AppQuickSolutions.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PartState {

    DESARROLLO, 
    EN_PRODUCCION, //se setea como predetermianada cuando se crea la pieza del proyecto 
    CONTROL_CALIDAD_EN_FABRICA, //control de calidad, durabilidad y medidas de la pieza-si la pieza no pasa el control pasaria al estado DEVOLUCION_FUERA_DE_MEDIDA
    SOLDADO_FLAPEADO, //confeccionado, soldado y flapeado de la pieza
    FOFATIZADO_LIJADO, //paso previo al pintado
    PINTADO, //pintado de piezas y ensamblado, una vez que pasan al embalado, no se habilita la seccion de embalado de la pieza hasta que pasen 12hs de secado de pieza
    EMBALADO, //en esta instancia de embalado van a llegar varias piezas unidas en una pieza universal, se tiene que generar un qr para que cuando se esten cargando en el camion para enviar a la instalacion se pueda hacer un control rapido de presencia de las piezas
    INSTALACION_DOMICILIO, //en camino a instalacion en domicilio
    INSTALADO_EXITOSO, //una vez que se instalo el frente de parrilla con todas sus piezas
    FALTANTE, //instancia en la que la pieza no llgo a la fabrica, posiblemente el plegador no la envio. y nunca se escaneo
    DEVOLUCION_FUERA_DE_MEDIDA, //la pieza que envio el plegador o el productor, esta fuera de medida
    REPINTANDO_POR_GOLPE_O_RAYON, //hay que volver a pintar la pieza- este estado tiene que estar la opcion para pasarse manualmente a partir del pintado en adelante
    REPARACION; //hay que reparar- este estado tiene que estar la opcion para pasarse manualmente a partir del CONTROL_CALIDAD

    @JsonValue
    public String getValue() {
        return this.name();
    }

    @JsonCreator
    public static PartState fromValue(String value) {
        return PartState.valueOf(value.toUpperCase());
    }
}
