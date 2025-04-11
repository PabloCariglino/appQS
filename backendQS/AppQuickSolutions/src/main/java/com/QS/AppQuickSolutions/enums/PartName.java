package com.QS.AppQuickSolutions.enums;

public enum PartName {
    GUIA_LATERAL("guia_lateral.png"),
    FRENTE_GUIA_LATERAL("frente_guia_lateral.png"),
    PUERTA_LEVADIZA("puerta_levadiza.png"),
    PANIO_FIJO_SUPERIOR("panio_fijo_superior.png"),
    FONDO_PTA_LEV("fondo_pta_lev.png"),
    ENCASTRE_UMBRAL_CON_BP("encastre_umbral_con_bp.png"),
    UMBRAL("umbral.png"),
    ANG_AMURE_UMBRAL("ang_amure_umbral.png"),
    ZOCALO_INOX("zocalo_inox.png"),
    TECHITO_INOX("techito_inox.png"),
    PTA_BP("pta_bp.png"),
    FONDO_DE_PTA_BP("fondo_de_pta_bp.png"),
    DIVISOR_FOGONERO("divisor_fogonero.png"),
    GRASERO("grasero.png"),
    MARCO_SUPERIOR("marco_superior.png"),

    // ALACENA
    PUERTA_ALACENA("puerta_alacena.png"),
    FONDO_PUERTA_ALACENA("fondo_puerta_alacena.png"),
    TAPA_SUPERIOR_ALACENA("tapa_superior_alacena.png"),
    ESTANTE_ALACENA("estante_alacena.png"),

    // COMPARTE ALACENA Y PUERTAS BAJO MESADA
    FRENTE_PUERTA("frente_puerta.png"),
    FONDO_PUERTA("fondo_puerta.png"),

    // PUERTAS BAJO MESADA
    PUERTA_BAJO_MESADA("puerta_bajo_mesada.png"),
    FONDO_DE_PUERTA_BAJO_MESADA("fondo_de_puerta_bajo_mesada.png"),

    // PIEZA PERSONALIZADA
    PIEZA_PERSONALIZADA("pieza_personalizada.png"),

    // PARRILLA
    LATERAL_MARCO_PARRILLA("lateral_marco_parrilla.png"),// ENLOSADO
    FRENTE_MARCO_PARRILLA("frente_marco_parrilla.png"),// ENLOSADO
    // ENLOSADO
    // PAÑO DE PARRILLA , OPCION ENLOSADO
    // ACHURERO , CON ENLOSADO
    // PLANCHETA , CON ENLOSAR
    CANASTO_FOGONERO("canasto_fogonero.png");

    private String imageFileName;

    PartName(String imageFileName) {
        this.imageFileName = imageFileName;
    }

    public String getImageFileName() {
        return imageFileName;
    }
}

