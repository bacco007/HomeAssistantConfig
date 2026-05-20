import type { ComponentTranslations } from "@/lib/i18n/types";

export const translations: ComponentTranslations = {
  "entity_id={0}": "entity_id={0}",
  "device_id={0}": "device_id={0}",
  "area_id={0}": "area_id={0}",
  "label_id={0}": "label_id={0}",
  none: "ei mitään",
  "If raw recorder history is incomplete or unavailable, fetch Home Assistant statistics for continuity and call out the retention boundary explicitly.":
    "Jos raakarekisterihistoria on puutteellinen tai ei saatavilla, hae jatkuvuuden varmistamiseksi Home Assistantin tilastot ja kerro säilytysrajan vaikutuksesta selkeästi.",
  "The requested window spans about {0} days. Short-retention raw history may not fully cover this range, so use Home Assistant statistics for older or missing portions and do not infer 'no anomalies' from retention gaps.":
    "Pyydetty aikaväli kattaa noin {0} päivää. Lyhyt raakadatansäilytys ei välttämättä kata tätä aluetta kokonaan, joten käytä vanhempiin tai puuttuviin osuuksiin Home Assistantin tilastoja äläkä päättele säilytyskatkoista, ettei poikkeamia olisi.",
  "Use raw recorder history first for this range. If raw history is incomplete or unavailable, fetch Home Assistant statistics and explain any retention or recorder gaps.":
    "Käytä tällä aikavälillä ensisijaisesti raakaa recorder-historiaa. Jos raakadata on puutteellista tai ei saatavilla, hae Home Assistantin tilastot ja selitä mahdolliset säilytys- tai recorder-katkokset.",
  "Entity metadata:": "Entiteetin metatiedot:",
  "CURRENT RANGE ANOMALY FINDINGS": "NYKYISEN AJANJAKSON POIKKEAMALÖYDÖKSET",
  "Current anomaly findings are not available from the active chart state, so use the query inputs below to fetch and inspect anomaly clusters directly.":
    "Nykyisiä poikkeamalöydöksiä ei ole saatavilla aktiivisen kaavion tilasta, joten hae ja tarkastele poikkeamaklustereita suoraan alla olevilla kyselysyötteillä.",
  "Snapshot range label:": "Tilannekuvan aikavälin nimi:",
  "main range": "pääaikaväli",
  "Correlated anomaly highlighting enabled in chart:":
    "Korrelatiivisten poikkeamien korostus kaaviossa käytössä:",
  yes: "kyllä",
  no: "ei",
  "Current anomaly overlap mode:": "Nykyinen poikkeamien päällekkäisyystila:",
  "Correlated anomaly periods across the selected datapoints:":
    "Korrelatiiviset poikkeamajaksot valittujen datapisteiden välillä:",
  "No entity-level anomaly findings are currently available from the active chart snapshot.":
    "Aktiivisen kaaviotilannekuvan perusteella ei ole tällä hetkellä saatavilla entiteettikohtaisia poikkeamalöydöksiä.",
  "Entity findings:": "Entiteetin löydökset:",
  "Detected clusters in current range:":
    "Havaitut klusterit nykyisellä aikavälillä:",
  "Displayed clusters under the current overlap/correlation mode:":
    "Näytetyt klusterit nykyisessä päällekkäisyys-/korrelaatiotilassa:",
  "All detected anomaly cluster details:":
    "Kaikkien havaittujen poikkeamaklustereiden tiedot:",
  "Displayed anomaly cluster details:":
    "Näytettyjen poikkeamaklustereiden tiedot:",
  "Entity:": "Entiteetti:",
  "Display name:": "Näyttönimi:",
  "Visible in panel:": "Näkyvissä paneelissa:",
  "Anomaly analysis: disabled in the current panel configuration.":
    "Poikkeama-analyysi: pois käytöstä nykyisessä paneelikokoonpanossa.",
  "Anomaly analysis: enabled.": "Poikkeama-analyysi: käytössä.",
  "Backend anomaly query inputs:":
    "Taustajärjestelmän poikkeamakyselyn syötteet:",
  "Raw history query inputs:": "Raakahistorian kyselysyötteet:",
  "Comparison window reference:": "Vertailuikkunan viite:",
  "Comparison window raw history query inputs:":
    "Vertailuikkunan raakahistorian kyselysyötteet:",
  "Comparison window anomaly query inputs:":
    "Vertailuikkunan poikkeamakyselyn syötteet:",
  "Comparison window detail: the configured comparison window is not currently selected, so use the window id above to resolve the saved date window before querying.":
    "Vertailuikkunan yksityiskohta: määritettyä vertailuikkunaa ei ole tällä hetkellä valittu, joten ratkaise tallennettu päivämääräikkuna yllä olevan ikkunatunnuksen avulla ennen kyselyä.",
  "Baseline comparison entity:": "Vertailun peruslinjan entiteetti:",
  "If your Home Assistant tooling requires explicit baseline range inputs, use the same start/end range as the main anomaly query unless a more specific monitor or MCP tool requires otherwise.":
    "Jos Home Assistant -työkalusi vaatii erilliset peruslinjan aikavälisyötteet, käytä samaa alku-/loppuväliä kuin pääpoikkeamakyselyssä, ellei tarkempi monitori- tai MCP-työkalu vaadi muuta.",
  "RELEVANT PERSISTED MONITORS": "OLENNAISET TALLENNETUT MONITORIT",
  "No persisted anomaly monitors intersect the currently selected entities.":
    "Yksikään tallennettu poikkeamamonitori ei leikkaa tällä hetkellä valittuja entiteettejä.",
  "Monitor: {0} ({1})": "Monitori: {0} ({1})",
  "Type:": "Tyyppi:",
  "Enabled:": "Käytössä:",
  "Entities:": "Entiteetit:",
  "Monitor anomaly query inputs:": "Monitorin poikkeamakyselyn syötteet:",
  "AI QUERY BRIEF: HOME ASSISTANT DATAPOINTS PANEL":
    "AI-KYSELYTIIVISTELMÄ: HOME ASSISTANT DATAPOINTS -PANEELI",
  OBJECTIVE: "TAVOITE",
  "Fetch the underlying Home Assistant history or statistics, entity metadata, and hass_datapoints anomaly detail needed to inspect the currently selected datapoints. Do not treat this brief as the raw data itself.":
    "Hae valittujen datapisteiden tutkimiseen tarvittava Home Assistantin historia tai tilastot, entiteettien metatiedot sekä hass_datapoints-poikkeamayksityiskohdat. Älä käsittele tätä tiivistelmää itse raakadatana.",
  "SUCCESS CRITERIA": "ONNISTUMISKRITEERIT",
  "- Resolve entity metadata context for each selected entity.":
    "- Ratkaise jokaiselle valitulle entiteetille metatietokonteksti.",
  "- Fetch raw or best-available historical coverage for the requested range.":
    "- Hae pyydetylle aikavälille raakadata tai paras saatavilla oleva historiallinen kattavuus.",
  "- Reproduce hass_datapoints anomaly queries with the exact panel settings below.":
    "- Toista hass_datapoints-poikkeamakyselyt alla olevilla täsmällisillä paneeliasetuksilla.",
  "- Review current-range anomaly findings from this integration, including cross-entity correlated anomaly periods when present.":
    "- Tarkista tämän integraation nykyisen aikavälin poikkeamalöydökset, mukaan lukien entiteettien väliset korreloivat poikkeamajaksot, kun niitä on.",
  "- Call out any retention, sampling, permission, or monitor-lookup limitations.":
    "- Kerro mahdollisista säilytys-, näytteistys-, käyttöoikeus- tai monitorihakurajoituksista.",
  "RETRIEVAL PRIORITY": "HAAUN PRIORITEETTI",
  "1. Resolve entity metadata first so area, device, platform, labels, and unit context are known before interpretation.":
    "1. Ratkaise ensin entiteetin metatiedot, jotta alue-, laite-, alusta-, tunniste- ja yksikkökonteksti ovat tiedossa ennen tulkintaa.",
  "2. Fetch raw recorder history for the requested range where available.":
    "2. Hae pyydetylle aikavälille raaka recorder-historia siellä, missä sitä on saatavilla.",
  "3. If raw history is incomplete, unavailable, or truncated by retention, fetch Home Assistant statistics for continuity.":
    "3. Jos raakadata on puutteellista, ei saatavilla tai säilytyksen takia katkennutta, hae jatkuvuuden varmistamiseksi Home Assistantin tilastot.",
  "4. Reproduce the hass_datapoints anomaly queries exactly as listed below.":
    "4. Toista hass_datapoints-poikkeamakyselyt täsmälleen alla kuvatulla tavalla.",
  "5. Because anomaly analysis may use sampled data, compare raw history for ground truth against sampled series for anomaly reproduction.":
    "5. Koska poikkeama-analyysi voi käyttää näytteistettyä dataa, vertaa raakadataa näytteistettyyn sarjaan poikkeamien toistamiseksi.",
  "6. Review the current anomaly findings already found by this integration in the active range and use them to guide deeper inspection.":
    "6. Tarkista integraation aktiivisella aikavälillä jo löytämät poikkeamat ja käytä niitä syvemmän tutkimisen ohjaamiseen.",
  "7. If monitor context is available, fetch relevant monitor anomaly output for additional persisted monitor detail.":
    "7. Jos monitorikonteksti on saatavilla, hae olennaisten monitorien poikkeamaulostulo lisätietoja varten.",
  "PANEL CONTEXT": "PANEELIN KONTEKSTI",
  "Selected entity ids:": "Valitut entiteettitunnukset:",
  "(none selected)": "(ei valittuja)",
  "Raw target selection summary:": "Raakatavoitevalinnan yhteenveto:",
  "Datapoint scope:": "Datapisteiden laajuus:",
  "Main range start_time:": "Pääaikavälin start_time:",
  "(not set)": "(ei asetettu)",
  "Main range end_time:": "Pääaikavälin end_time:",
  "Committed zoom start_time:": "Vahvistetun zoomin start_time:",
  "Committed zoom end_time:": "Vahvistetun zoomin end_time:",
  "Selected comparison window id:": "Valitun vertailuikkunan tunnus:",
  "(none)": "(ei mitään)",
  "Comparison windows:": "Vertailuikkunoita:",
  "Chart anomaly overlap mode:": "Kaavion poikkeamien päällekkäisyystila:",
  "RANGE / RETENTION NOTE": "AIKAVÄLI / SÄILYTYS -HUOMIO",
  "QUERY RULES": "KYSELYSÄÄNNÖT",
  "- Use UTC timestamps exactly as written for retrieval.":
    "- Käytä haussa UTC-aikaleimoja täsmälleen kirjoitetussa muodossa.",
  "- Convert to the Home Assistant local timezone only when interpreting daily or weekly behavior patterns.":
    "- Muunna Home Assistantin paikalliseen aikavyöhykkeeseen vasta päivittäisiä tai viikoittaisia käyttäytymismalleja tulkittaessa.",
  "- Do not infer 'no anomaly' from missing raw history when retention may be limited.":
    "- Älä päättele puuttuvasta raakadatasta, ettei poikkeamia ole, jos säilytys voi olla rajallinen.",
  "- If anomaly queries below use sampled data, inspect both raw history and the sampled representation.":
    "- Jos alla olevat poikkeamakyselyt käyttävät näytteistettyä dataa, tarkista sekä raakadata että näytteistetty esitys.",
  "- For long ranges, remember HA history pagination and retention constraints can change what raw coverage is available.":
    "- Pitkillä aikaväleillä muista, että HA-historian sivutus ja säilytysrajoitukset voivat muuttaa saatavilla olevan raakakattavuuden määrää.",
  "RAW TARGET SELECTION OBJECT": "RAAKA TAVOITEVALINTAOLIO",
  "AVAILABLE COMPARISON WINDOWS": "SAATAVILLA OLEVAT VERTAILUIKKUNAT",
  "PER-ENTITY QUERY DETAILS": "ENTITEETTIKOHTAISET KYSELYTIEDOT",
  "No selected entities are currently available in the panel state.":
    "Paneelin tilassa ei ole tällä hetkellä saatavilla valittuja entiteettejä.",
  "RECOMMENDED OUTPUT": "SUOSITELTU TULOSTE",
  "- Resolved metadata per selected entity, including unit, device class, state class, area, device, labels, and platform when available.":
    "- Ratkaistut metatiedot valittua entiteettiä kohden, mukaan lukien yksikkö, laiteluokka, tilaluokka, alue, laite, tunnisteet ja alusta, kun ne ovat saatavilla.",
  "- Coverage status of raw history versus statistics, including any retention or pagination limits encountered.":
    "- Raakadatan ja tilastojen kattavuustila, mukaan lukien mahdolliset vastaan tulleet säilytys- tai sivutusrajoitukset.",
  "- Detailed anomaly findings per entity for the requested range, using the current integration findings above plus any fetched raw cluster detail.":
    "- Yksityiskohtaiset poikkeamalöydökset entiteettiä kohden pyydetyllä aikavälillä käyttäen yllä olevia integraation nykyhavaintoja sekä mahdollisia haettuja raakoja klusteritietoja.",
  "- If anomalies indicate some type of event, zoom out and look for answers in the related area/group/labels or across other entities in the panel. If anomalies are unexpected, look for any subtle metadata clues that could explain them, such as a device class or state class that implies a different expected behavior pattern than initially assumed.":
    "- Jos poikkeamat viittaavat jonkinlaiseen tapahtumaan, zoomaa ulos ja etsi selityksiä liittyvästä alueesta/ryhmästä/tunnisteista tai paneelin muista entiteeteistä. Jos poikkeamat ovat odottamattomia, etsi hienovaraisia metatietovihjeitä, kuten laite- tai tilaluokka, jotka voivat selittää tilanteen.",
  "- Correlated anomaly periods across the selected datapoints, if any are present, including which entities participate and when the overlap occurs.":
    "- Korrelatiiviset poikkeamajaksot valittujen datapisteiden välillä, jos niitä on, mukaan lukien osallistuvat entiteetit ja ajankohta, jolloin päällekkäisyys tapahtuu.",
  "- Any monitor-access, permission, sampling, comparison-window, or data-coverage limitations that materially affect interpretation.":
    "- Kaikki monitoripääsyn, käyttöoikeuksien, näytteistyksen, vertailuikkunoiden tai datakattavuuden rajoitteet, jotka vaikuttavat tulkintaan olennaisesti.",
};
