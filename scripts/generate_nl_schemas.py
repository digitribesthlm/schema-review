#!/usr/bin/env python3
"""
Generate Schema Markup for climber.nl — 34 pages.

All descriptions, keywords, and Q&A pairs are taken verbatim from the page content
(crawled via Jina), using the language the page is written in (Dutch or English).

Pages are processed and saved to MongoDB one at a time. If a page fails, the rest
continue. Already-saved pages are skipped unless --force is passed.

Usage:
    python3 execution/generate_nl_schemas.py              # skip already-saved
    python3 execution/generate_nl_schemas.py --force      # overwrite all
    python3 execution/generate_nl_schemas.py --drop       # wipe collection first
    python3 execution/generate_nl_schemas.py --url https://www.climber.nl/...  # single page
"""

import os, json, argparse, sys, time
from datetime import datetime, timezone
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

CLIENT_ID  = "69a5dab7503792298ba79835"   # climber.nl portal_clients _id
DOMAIN     = "climber.nl"
COLLECTION = "schema_workflow_climber_nl"
ORG_ID     = "https://www.climber.nl/#organization"

ORG_BLOCK = {
    "@type": "Organization",
    "@id": ORG_ID,
    "name": "Climber Nederland B.V.",
    "url": "https://www.climber.nl",
    "logo": "https://www.climber.nl/wp-content/themes/climber/images/climber-part-of-digia-logo.svg",
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+31 85 773 10 02",
        "contactType": "Customer Service",
        "areaServed": "NL",
        "availableLanguage": ["Dutch", "English"]
    },
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Expolaan 50",
        "addressLocality": "Hengelo",
        "postalCode": "7556 BE",
        "addressCountry": "NL"
    },
    "sameAs": [
        "https://www.linkedin.com/company/climber-nederland/"
    ]
}


def svc(url_id, service_type, name, description, keywords, lang="nl"):
    return [
        {
            "@type": "Service",
            "@id": f"{url_id}#service",
            "serviceType": service_type,
            "name": name,
            "description": description,
            "provider": {"@id": ORG_ID},
            "areaServed": "NL",
            "inLanguage": lang,
            "keywords": keywords
        },
        ORG_BLOCK
    ]


def software(url_id, app_name, description, category, keywords,
             operating_system="Web", lang="en"):
    return [
        {
            "@type": "SoftwareApplication",
            "@id": f"{url_id}#software",
            "name": app_name,
            "description": description,
            "applicationCategory": category,
            "operatingSystem": operating_system,
            "inLanguage": lang,
            "offers": {
                "@type": "Offer",
                "seller": {"@id": ORG_ID}
            },
            "keywords": keywords
        },
        ORG_BLOCK
    ]


def collection_page(url_id, name, description, keywords, lang="nl"):
    return [
        {
            "@type": "CollectionPage",
            "@id": f"{url_id}#collectionpage",
            "name": name,
            "description": description,
            "publisher": {"@id": ORG_ID},
            "inLanguage": lang,
            "keywords": keywords
        },
        ORG_BLOCK
    ]


def article(url_id, headline, description, keywords, about, lang="nl"):
    return [
        {
            "@type": "Article",
            "@id": f"{url_id}#article",
            "headline": headline,
            "description": description,
            "author": {"@id": ORG_ID},
            "publisher": {"@id": ORG_ID},
            "about": about,
            "inLanguage": lang,
            "keywords": keywords
        },
        ORG_BLOCK
    ]


def faq(qa_pairs, lang="en"):
    return [
        {
            "@type": "FAQPage",
            "inLanguage": lang,
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": q,
                    "acceptedAnswer": {"@type": "Answer", "text": a}
                }
                for q, a in qa_pairs
            ]
        }
    ]


def build_schema_body(graph):
    return json.dumps(
        {"@context": "https://schema.org", "@graph": graph},
        ensure_ascii=False, indent=2
    )


# ─── PAGE DEFINITIONS ────────────────────────────────────────────────────────
# All copy is taken from the live page (crawled via Jina).
# Dutch pages use lang="nl", English pages use lang="en".

PAGES = [

    # ── SERVICES (Dutch) ───────────────────────────────────────────────────────
    {
        "url": "https://www.climber.nl/onze-diensten/services/",
        "page_title": "Services – Climber Nederland",
        "page_type": "services",
        "primary_schema": "Service",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Climber biedt een uitgebreid aanbod dat echt waarde toevoegt aan "
            "de BI-reis. We helpen met strategie, ontwikkeling en implementatie "
            "om de BI-reis te starten of een goed vervolg te geven. Onze "
            "oplossingen bieden snel en gemakkelijk toegang tot gegevens, zodat "
            "gebruikers zich kunnen focussen op analyseren in plaats van "
            "verzamelen van data."
        ),
        "bq_main_topic": "Business Intelligence diensten van Climber Nederland",
        "bq_keywords": [
            {"term": "Business Intelligence", "importance": "1.0"},
            {"term": "BI-reis", "importance": "0.95"},
            {"term": "Data Strategie", "importance": "0.9"},
            {"term": "Climber Nederland", "importance": "0.88"},
            {"term": "Qlik", "importance": "0.85"}
        ],
        "bq_entities": [
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "Business Intelligence", "type": "concept", "importance": "1.0"},
            {"name": "Qlik", "type": "product", "importance": "0.85"}
        ],
        "schema_fn": lambda: build_schema_body(svc(
            "https://www.climber.nl/onze-diensten/services/",
            "Business Intelligence Consulting",
            "Services – Climber Nederland",
            (
                "Climber biedt een uitgebreid aanbod dat echt waarde toevoegt "
                "aan de BI-reis. We helpen met strategie, ontwikkeling en "
                "implementatie om de BI-reis te starten of een goed vervolg te "
                "geven. Gefundeerde besluitvorming op basis van feiten om je "
                "organisatie met volle snelheid vooruit te bewegen."
            ),
            "Business Intelligence, BI diensten, data strategie, data analytics, "
            "Qlik, Climber, BI-reis",
            lang="nl"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/services/data-strategie/",
        "page_title": "Data Strategie – Climber Nederland",
        "page_type": "services",
        "primary_schema": "Service",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Een datastrategie helpt je richting te geven, keuzes te maken en "
            "voorkomt dat je budget en resources verbrandt aan projecten die "
            "geen waarde opleveren. Climber helpt je van losse initiatieven naar "
            "een samenhangend plan dat werkt, afgestemd op je doelen én ambities."
        ),
        "bq_main_topic": "Data strategie consulting door Climber Nederland",
        "bq_keywords": [
            {"term": "Data Strategie", "importance": "1.0"},
            {"term": "Datastrategie", "importance": "0.95"},
            {"term": "data gedreven organisatie", "importance": "0.9"},
            {"term": "Data Strategy Fast Track", "importance": "0.85"},
            {"term": "dataplatform", "importance": "0.8"}
        ],
        "bq_entities": [
            {"name": "Data Strategie", "type": "concept", "importance": "1.0"},
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "Data Strategy Fast Track", "type": "product", "importance": "0.85"}
        ],
        "schema_fn": lambda: build_schema_body(svc(
            "https://www.climber.nl/onze-diensten/services/data-strategie/",
            "Data Strategie Consulting",
            "Data Strategie – Climber Nederland",
            (
                "Je hebt al stappen gezet in data-analyse en rapportages, maar hoe "
                "zorg je ervoor dat alle initiatieven samenhangen en bijdragen aan "
                "het behalen van de strategische doelen? Climber helpt je van losse "
                "initiatieven naar een samenhangend plan: geen standaard blauwdruk, "
                "maar een strategie op maat afgestemd op jouw situatie, ambities en "
                "organisatiecultuur."
            ),
            "Data Strategie, Datastrategie, data gedreven organisatie, "
            "dataplatform, Data Strategy Fast Track, Business Intelligence",
            lang="nl"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/services/data-analytics/",
        "page_title": "Data Analytics – Climber Nederland",
        "page_type": "services",
        "primary_schema": "Service",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Haal meer waarde uit je bestaande data-analyse. Je hebt al KPI's, "
            "dashboards en rapportages, maar wordt er wel gebruik van gemaakt en "
            "leidt het wel tot betere beslissingen? Onze Data Analytics Health "
            "Check helpt je om van losse analyses naar gestroomlijnd inzicht te "
            "gaan. Gericht op resultaat, met draagvlak in de organisatie."
        ),
        "bq_main_topic": "Data analytics diensten van Climber Nederland",
        "bq_keywords": [
            {"term": "Data Analytics", "importance": "1.0"},
            {"term": "Data Analytics Health Check", "importance": "0.95"},
            {"term": "KPI Dashboard", "importance": "0.9"},
            {"term": "data gedreven besluitvorming", "importance": "0.88"},
            {"term": "stuurinformatie", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Data Analytics", "type": "concept", "importance": "1.0"},
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "Data Analytics Health Check", "type": "product", "importance": "0.9"}
        ],
        "schema_fn": lambda: build_schema_body(svc(
            "https://www.climber.nl/onze-diensten/services/data-analytics/",
            "Data Analytics Consulting",
            "Data Analytics – Climber Nederland",
            (
                "Haal meer waarde uit je bestaande data-analyse. Er zijn rapporten "
                "genoeg, maar in de praktijk wordt er weinig mee gedaan. Onze Data "
                "Analytics Health Check brengt in een ochtend of middag scherp in "
                "beeld waar je staat, wat je mist, en hoe je meer waarde haalt uit "
                "je bestaande data. Gericht op resultaat, met draagvlak in de "
                "organisatie."
            ),
            "Data Analytics, Data Analytics Health Check, KPI, stuurinformatie, "
            "dashboards, data gedreven besluitvorming, Business Intelligence",
            lang="nl"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/services/ai-ready/",
        "page_title": "AI-Ready – Climber Nederland",
        "page_type": "services",
        "primary_schema": "Service",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Klaar om écht waarde uit AI te halen? AI vraagt om meer dan alleen "
            "goede tools — het vraagt om structuur, datakwaliteit, een duidelijke "
            "business case en draagvlak. Wij helpen je te bepalen welke kansen en "
            "AI use cases haalbaar zijn en wat je vandaag al kunt doen."
        ),
        "bq_main_topic": "AI-readiness consultancy door Climber Nederland",
        "bq_keywords": [
            {"term": "AI-ready", "importance": "1.0"},
            {"term": "AI Business Case Workshop", "importance": "0.95"},
            {"term": "datakwaliteit", "importance": "0.9"},
            {"term": "AI use cases", "importance": "0.88"},
            {"term": "AI-geletterdheid", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "AI-ready", "type": "concept", "importance": "1.0"},
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "AI Business Case Workshop", "type": "product", "importance": "0.9"}
        ],
        "schema_fn": lambda: build_schema_body(svc(
            "https://www.climber.nl/onze-diensten/services/ai-ready/",
            "AI-Readiness Consulting",
            "AI-Ready – Climber Nederland",
            (
                "Klaar om écht waarde uit AI te halen? Je bent al actief met data, "
                "dashboards en analyses. Maar AI vraagt om meer dan alleen goede "
                "tools — het vraagt om structuur, datakwaliteit, een duidelijke "
                "business case en draagvlak. Wij helpen je te bepalen welke kansen "
                "en AI use cases haalbaar zijn via onze AI Business Case Workshop: "
                "een interactieve sessie van drie uur."
            ),
            "AI-ready, AI Business Case Workshop, AI use cases, datakwaliteit, "
            "AI-geletterdheid, data gedreven, Climber Nederland",
            lang="nl"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/services/architectuur/",
        "page_title": "Data Management & Cloud Services – Climber Nederland",
        "page_type": "services",
        "primary_schema": "Service",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Architectuur voor een snelle en veilige BI-omgeving. Climber heeft "
            "een gespecialiseerd team — Climber Expert Services — dat uitsluitend "
            "werkt aan verbetering van de BI-infrastructuur: architectuuradvies, "
            "installaties, upgrades, migraties en testen van BI-omgevingen."
        ),
        "bq_main_topic": "BI-architectuur en cloud services door Climber Nederland",
        "bq_keywords": [
            {"term": "BI-architectuur", "importance": "1.0"},
            {"term": "Climber Expert Services", "importance": "0.95"},
            {"term": "BI-infrastructuur", "importance": "0.9"},
            {"term": "Cloud Services", "importance": "0.88"},
            {"term": "BI-omgeving", "importance": "0.85"}
        ],
        "bq_entities": [
            {"name": "Climber Expert Services", "type": "product", "importance": "1.0"},
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "BI-architectuur", "type": "concept", "importance": "0.9"}
        ],
        "schema_fn": lambda: build_schema_body(svc(
            "https://www.climber.nl/onze-diensten/services/architectuur/",
            "BI-Architectuur & Cloud Services",
            "Data Management & Cloud Services – Climber Nederland",
            (
                "Architectuur voor een snelle en veilige BI-omgeving. Climber Expert "
                "Services werkt aan architectuuradvies, installaties, upgrades en "
                "migraties van BI-omgevingen. Wij analyseren het huidige IT-landschap, "
                "specificeren hardware requirements en zorgen dat de infrastructuur "
                "stabiel en performant is voor de lange termijn."
            ),
            "BI-architectuur, Climber Expert Services, BI-infrastructuur, "
            "cloud hosting, BI-omgeving, migratie, performance",
            lang="nl"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/services/support/",
        "page_title": "Climber Support Services – Climber Nederland",
        "page_type": "services",
        "primary_schema": "Service",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Ondersteunende diensten voor een duurzame BI-oplossing. Climber "
            "Expert Services fungeert als single-point-of-contact voor alle "
            "BI-gerelateerde onderwerpen. We bieden applicatie-onderhoud, "
            "cloud- en hosting-services, technische reviews en systeem- en "
            "applicatiemonitoring."
        ),
        "bq_main_topic": "BI support en beheer door Climber Nederland",
        "bq_keywords": [
            {"term": "Climber Support Services", "importance": "1.0"},
            {"term": "Climber Expert Services", "importance": "0.95"},
            {"term": "BI beheer", "importance": "0.9"},
            {"term": "applicatie onderhoud", "importance": "0.88"},
            {"term": "SLA", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Climber Support Services", "type": "product", "importance": "1.0"},
            {"name": "Climber Expert Services", "type": "product", "importance": "0.95"},
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"}
        ],
        "schema_fn": lambda: build_schema_body(svc(
            "https://www.climber.nl/onze-diensten/services/support/",
            "BI Support & Beheer",
            "Climber Support Services – Climber Nederland",
            (
                "Ondersteunende diensten voor een duurzame BI-oplossing. Ons team "
                "Climber Expert Services fungeert als single-point-of-contact voor "
                "alle BI-gerelateerde onderwerpen. We bieden applicatie-onderhoud, "
                "cloud- en hosting-services, technische reviews, systeem- en "
                "applicatiemonitoring en SLA-ondersteuning met een reactietijd van "
                "2 uur of minder."
            ),
            "Climber Support Services, Climber Expert Services, BI beheer, "
            "applicatie onderhoud, SLA, monitoring, Qlik hosting",
            lang="nl"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/services/training/",
        "page_title": "Data Literacy & Training – Climber Nederland",
        "page_type": "services",
        "primary_schema": "Service",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Door jou en je collega's wordt een BI-oplossing meer dan alleen een "
            "tool. Data wordt informatie en informatie wordt omgezet in inzichten. "
            "Climber verzorgt training, governance en best practices voor "
            "BI-gebruikers en interne ontwikkelaars."
        ),
        "bq_main_topic": "Business Intelligence training en data literacy",
        "bq_keywords": [
            {"term": "Data Literacy", "importance": "1.0"},
            {"term": "Business Intelligence Training", "importance": "0.95"},
            {"term": "gebruikersacceptatie", "importance": "0.9"},
            {"term": "BI governance", "importance": "0.85"},
            {"term": "Qlik training", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Data Literacy", "type": "concept", "importance": "1.0"},
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "Qlik", "type": "product", "importance": "0.85"}
        ],
        "schema_fn": lambda: build_schema_body(svc(
            "https://www.climber.nl/onze-diensten/services/training/",
            "Business Intelligence Training & Data Literacy",
            "Data Literacy & Training – Climber Nederland",
            (
                "Door jou en je collega's wordt een BI-oplossing meer dan alleen "
                "een tool: data wordt informatie en informatie wordt omgezet in "
                "inzichten. Climber verzorgt gebruikerstraining, trainingssessies "
                "voor interne ontwikkelaars, governance en best practices. "
                "Permanente aandacht voor training versnelt het acceptatieproces "
                "en is een succesfactor voor efficiënte inzet van BI."
            ),
            "Business Intelligence Training, Data Literacy, gebruikersacceptatie, "
            "BI governance, Qlik training, BI-oplossing",
            lang="nl"
        ))
    },

    {
        "url": "https://www.climber.nl/move-to-qlik-cloud/",
        "page_title": "Move to Qlik Cloud – Climber Nederland",
        "page_type": "services",
        "primary_schema": "Service",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Climber has extensive experience helping clients migrate to Qlik Cloud "
            "or move from legacy products such as QlikView. With Qlik Cloud Analytics "
            "you create, reload, and consume your Qlik Sense apps entirely on Qlik's "
            "hosted cloud platform — scalable, always up to date, no software upgrades."
        ),
        "bq_main_topic": "Qlik Cloud migration services by Climber Nederland",
        "bq_keywords": [
            {"term": "Move to Qlik Cloud", "importance": "1.0"},
            {"term": "Qlik Cloud migration", "importance": "0.95"},
            {"term": "QlikView migration", "importance": "0.9"},
            {"term": "Qlik Cloud Analytics", "importance": "0.88"},
            {"term": "Qlik modernisation", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Qlik Cloud", "type": "product", "importance": "1.0"},
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "QlikView", "type": "product", "importance": "0.85"}
        ],
        "schema_fn": lambda: build_schema_body(svc(
            "https://www.climber.nl/move-to-qlik-cloud/",
            "Qlik Cloud Migration",
            "Move to Qlik Cloud – Climber Nederland",
            (
                "Climber has extensive experience helping clients migrate to Qlik Cloud "
                "or move from legacy products such as QlikView. We help you avoid the "
                "pitfalls and ensure a seamless migration. With Qlik Cloud Analytics you "
                "create, reload, and consume your Qlik Sense apps entirely on Qlik's "
                "hosted cloud platform — scalable, easy to access, with the latest "
                "features released monthly."
            ),
            "Move to Qlik Cloud, Qlik Cloud migration, QlikView migration, "
            "Qlik Cloud Analytics, Qlik modernisation, cloud analytics",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/services/climber-agentic-reporting/",
        "page_title": "Climber Agentic Reporting – Climber Nederland",
        "page_type": "services",
        "primary_schema": "Service",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "AI-gestuurde inzichten, precies zoals jij ze wilt. Climber Agentic "
            "Reporting zet AI in als partner voor analyse en storytelling. Van "
            "automatische tekstuele samenvattingen tot Q&A op je data en zelfs "
            "een podcastversie van je rapport."
        ),
        "bq_main_topic": "AI-gestuurde rapportage en storytelling met Climber Agentic Reporting",
        "bq_keywords": [
            {"term": "Climber Agentic Reporting", "importance": "1.0"},
            {"term": "AI-gestuurde inzichten", "importance": "0.95"},
            {"term": "geautomatiseerde narratives", "importance": "0.9"},
            {"term": "GenAI rapportage", "importance": "0.88"},
            {"term": "BI adoptie", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Climber Agentic Reporting", "type": "product", "importance": "1.0"},
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "GenAI", "type": "concept", "importance": "0.85"}
        ],
        "schema_fn": lambda: build_schema_body(svc(
            "https://www.climber.nl/onze-diensten/services/climber-agentic-reporting/",
            "AI-Gestuurde BI-Rapportage",
            "Climber Agentic Reporting – Climber Nederland",
            (
                "AI-gestuurde inzichten, precies zoals jij ze wilt. Climber Agentic "
                "Reporting zet AI in als partner voor analyse en storytelling. Van "
                "automatische tekstsamenvattingen van performance, uitzonderingen en "
                "trends, tot vragen stellen in gewone taal over de data en zelfs een "
                "podcastversie van je rapport — altijd in een vorm die past bij jouw "
                "werkdag. Vergroot de BI-adoptie van 25% naar 80%."
            ),
            "Climber Agentic Reporting, AI-gestuurde inzichten, geautomatiseerde "
            "narratives, GenAI, BI adoptie, podcast rapportage, Qlik Power BI",
            lang="nl"
        ))
    },

    # ── SOFTWARE ──────────────────────────────────────────────────────────────

    {
        "url": "https://www.climber.nl/onze-diensten/software/",
        "page_title": "Software – Climber Nederland",
        "page_type": "software",
        "primary_schema": "CollectionPage",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Om ervoor te zorgen dat wij je voorzien van een echt persoonlijke "
            "BI-oplossing, werken we met een aantal partners. Wij ontwikkelen een "
            "BI-oplossing die je zakelijke doelstellingen ondersteunt, die makkelijk "
            "te gebruiken is en uit te breiden. Met Qlik, Vizlib, Planacy en meer."
        ),
        "bq_main_topic": "Software portfolio van Climber Nederland voor Business Intelligence",
        "bq_keywords": [
            {"term": "Business Intelligence software", "importance": "1.0"},
            {"term": "Qlik", "importance": "0.95"},
            {"term": "data visualisatie", "importance": "0.9"},
            {"term": "Climber Nederland", "importance": "0.88"},
            {"term": "self service analytics", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "Qlik", "type": "product", "importance": "0.95"},
            {"name": "Vizlib", "type": "product", "importance": "0.8"}
        ],
        "schema_fn": lambda: build_schema_body(collection_page(
            "https://www.climber.nl/onze-diensten/software/",
            "Software – Climber Nederland",
            (
                "Om ervoor te zorgen dat Climber je voorziet van een echt "
                "persoonlijke BI-oplossing, werken we met een aantal partners. "
                "Wij ontwikkelen een BI-oplossing die je zakelijke doelstellingen "
                "ondersteunt, makkelijk te gebruiken is en uit te breiden op het "
                "onderwerp. Qlik is een leider in data discovery en self service "
                "data-visualisatie, zodat alle gebieden van het bedrijf er gebruik "
                "van kunnen maken."
            ),
            "Business Intelligence software, Qlik, Qlik Sense, Vizlib, Planacy, "
            "data visualisatie, self service analytics, BI-oplossing",
            lang="nl"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/qlik-cloud-analytics/",
        "page_title": "Qlik Cloud Analytics – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Democratise your data and empower all people in your organisation to "
            "make data driven decisions – whenever, wherever. Qlik Cloud Analytics "
            "delivers automated insight generation, natural language interaction, "
            "predictive analytics, and generative AI in one platform."
        ),
        "bq_main_topic": "Qlik Cloud Analytics platform — data driven decisions",
        "bq_keywords": [
            {"term": "Qlik Cloud Analytics", "importance": "1.0"},
            {"term": "data driven decisions", "importance": "0.95"},
            {"term": "Associative Engine", "importance": "0.9"},
            {"term": "augmented analytics", "importance": "0.88"},
            {"term": "natural language interaction", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Qlik Cloud Analytics", "type": "product", "importance": "1.0"},
            {"name": "Qlik", "type": "organization", "importance": "0.95"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/qlik-cloud-analytics/",
            "Qlik Cloud Analytics",
            (
                "Democratise your data and empower all people in your organisation "
                "to make data driven decisions – whenever, wherever. With Qlik Cloud "
                "Analytics you get a unique Associative Engine built specifically for "
                "analytics, automated insight generation using machine learning and "
                "generative AI, seamless natural language interaction, and alerting "
                "and automations delivered where the decisions are made."
            ),
            "BusinessApplication",
            "Qlik Cloud Analytics, Associative Engine, augmented analytics, "
            "natural language interaction, predictive analytics, generative AI, "
            "data driven decisions",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/qlik-sense-data-analyse/",
        "page_title": "Qlik Sense Data Analyse – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Qlik Sense is een modern en volledig webbased data analyse platform, "
            "gemaakt om iedereen binnen je organisatie data gedreven te laten werken. "
            "Ontworpen voor snelheid, in de cloud, on premise, of beide."
        ),
        "bq_main_topic": "Qlik Sense data analyse platform voor Nederlandse organisaties",
        "bq_keywords": [
            {"term": "Qlik Sense", "importance": "1.0"},
            {"term": "data analyse platform", "importance": "0.95"},
            {"term": "self service analytics", "importance": "0.9"},
            {"term": "data visualisatie", "importance": "0.88"},
            {"term": "associatieve in-memory technologie", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Qlik Sense", "type": "product", "importance": "1.0"},
            {"name": "Qlik", "type": "organization", "importance": "0.95"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/qlik-sense-data-analyse/",
            "Qlik Sense",
            (
                "Qlik Sense is een modern en volledig webbased data analyse platform, "
                "gemaakt om iedereen binnen je organisatie data gedreven te laten "
                "werken. Qlik Sense verzamelt gegevens uit meerdere bronnen en helpt "
                "dankzij de associatieve in-memory technologie om een compleet beeld "
                "te vormen over de prestaties van jouw organisatie. Met flexibel "
                "drag-and-drop self service en beveiligingsrollen op verschillende "
                "niveaus."
            ),
            "BusinessApplication",
            "Qlik Sense, data analyse platform, self service analytics, "
            "data visualisatie, associatieve in-memory technologie, "
            "drag-and-drop, QlikView migratie",
            lang="nl"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/qlik-predict/",
        "page_title": "Qlik Predict – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "With Qlik Predict, the passive BI where you look at historical data "
            "to understand what happened is a thing of the past. Recognising patterns "
            "and drivers in historical data to create models that predict future "
            "outcomes — all through an intuitive, code-free interface."
        ),
        "bq_main_topic": "Qlik Predict — predictive analytics and machine learning",
        "bq_keywords": [
            {"term": "Qlik Predict", "importance": "1.0"},
            {"term": "predictive analytics", "importance": "0.95"},
            {"term": "machine learning", "importance": "0.9"},
            {"term": "Explainable AI", "importance": "0.88"},
            {"term": "prescriptive analytics", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Qlik Predict", "type": "product", "importance": "1.0"},
            {"name": "Qlik", "type": "organization", "importance": "0.95"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/qlik-predict/",
            "Qlik Predict",
            (
                "With Qlik Predict (formerly AutoML) the passive BI where you look "
                "at historical data is a thing of the past. Qlik Predict makes it "
                "easy for everyone in your organisation's analytics team to use "
                "AI-powered machine learning and predictive analytics. Understand "
                "your past key drivers, generate predictive data and plan strategies "
                "— all through an intuitive, code-free interface. Includes "
                "Explainable AI and Prescriptive Analytics."
            ),
            "BusinessApplication",
            "Qlik Predict, predictive analytics, machine learning, Explainable AI, "
            "prescriptive analytics, AutoML, Qlik Cloud",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/qlik-answers/",
        "page_title": "Qlik Answers – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Meet Qlik Answers, your natural language AI assistant that helps you "
            "make better decisions and be more productive using all your trusted data. "
            "Powered by generative AI and RAG, now evolved into Qlik's cutting-edge "
            "agentic AI architecture."
        ),
        "bq_main_topic": "Qlik Answers — generative AI assistant for enterprise data",
        "bq_keywords": [
            {"term": "Qlik Answers", "importance": "1.0"},
            {"term": "natural language AI assistant", "importance": "0.95"},
            {"term": "generative AI", "importance": "0.9"},
            {"term": "RAG", "importance": "0.88"},
            {"term": "agentic AI", "importance": "0.85"}
        ],
        "bq_entities": [
            {"name": "Qlik Answers", "type": "product", "importance": "1.0"},
            {"name": "Qlik", "type": "organization", "importance": "0.95"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/qlik-answers/",
            "Qlik Answers",
            (
                "Meet Qlik Answers, your natural language AI assistant that helps "
                "you make better decisions and be more productive using all your "
                "trusted data. Powered by generative AI and RAG (Retrieval Augmented "
                "Generation), evolved into Qlik's agentic AI architecture. It combines "
                "the Qlik analytics engine with world-class LLMs to deliver complete, "
                "contextually relevant insights from both structured analytics and "
                "unstructured content — with full explainability and trust."
            ),
            "BusinessApplication",
            "Qlik Answers, natural language AI assistant, generative AI, RAG, "
            "agentic AI, unstructured data, Qlik analytics engine",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/qlik-insight-advisor/",
        "page_title": "Qlik Insight Advisor – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Qlik Insight Advisor is an AI-powered tool designed to make data analysis "
            "more accessible and intuitive for users across all skill levels. Using the "
            "Qlik Cognitive Engine, it automates the process of data discovery and "
            "visualisation through Natural Language Processing."
        ),
        "bq_main_topic": "Qlik Insight Advisor — AI-powered data discovery",
        "bq_keywords": [
            {"term": "Qlik Insight Advisor", "importance": "1.0"},
            {"term": "Qlik Cognitive Engine", "importance": "0.95"},
            {"term": "Natural Language Processing", "importance": "0.9"},
            {"term": "automated insight generation", "importance": "0.88"},
            {"term": "self-service data exploration", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Qlik Insight Advisor", "type": "product", "importance": "1.0"},
            {"name": "Qlik Cognitive Engine", "type": "product", "importance": "0.9"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/qlik-insight-advisor/",
            "Qlik Insight Advisor",
            (
                "Qlik Insight Advisor is an AI-powered tool within the Qlik Sense "
                "platform that leverages generative AI to help users discover insights "
                "in their data. The Qlik Cognitive Engine understands your data and "
                "the most appropriate visualisation to apply. Users can ask questions "
                "in plain text, select data fields, or choose analysis types — "
                "democratising data access across all skill levels without manual "
                "intervention."
            ),
            "BusinessApplication",
            "Qlik Insight Advisor, Qlik Cognitive Engine, Natural Language Processing, "
            "automated insight generation, self-service data exploration, Qlik Sense",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/vizlib/",
        "page_title": "Vizlib Extensions for Qlik – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Bring more power to your Qlik environment with Vizlib extensions. "
            "As a trusted Vizlib partner, Climber offers advanced capabilities that "
            "give you complete control over all design elements of your reports and "
            "enable smart, customised visualisations."
        ),
        "bq_main_topic": "Vizlib extensions for Qlik Analytics — power-up visualisations",
        "bq_keywords": [
            {"term": "Vizlib", "importance": "1.0"},
            {"term": "Vizlib Extensions for Qlik", "importance": "0.95"},
            {"term": "Qlik visualisations", "importance": "0.9"},
            {"term": "Vizlib Hidden Insights AI", "importance": "0.88"},
            {"term": "financial reporting extension", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Vizlib", "type": "product", "importance": "1.0"},
            {"name": "Qlik", "type": "product", "importance": "0.9"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/vizlib/",
            "Vizlib Extensions for Qlik",
            (
                "Bring more power to your Qlik environment with Vizlib extensions. "
                "As a trusted Vizlib partner, Climber offers a comprehensive range "
                "of value-added extensions for Qlik Analytics that enable you to "
                "power-up your visualisations and dashboards. The advanced capabilities "
                "give you complete control over all design elements of your reports. "
                "Includes Vizlib Hidden Insights AI for pattern discovery beyond your "
                "filters — no exports, no developers."
            ),
            "BusinessApplication",
            "Vizlib, Vizlib Extensions for Qlik, Qlik visualisations, "
            "Vizlib Hidden Insights AI, financial reporting, Gantt chart, "
            "KPI Designer, Qlik Analytics",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/mail-deploy-automated-reporting/",
        "page_title": "Mail & Deploy Automated Reporting – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "When your Qlik solution is helping to deliver great insights, you want "
            "to share them with your stakeholders quickly and easily. Mail & Deploy "
            "is a Qlik Technology Partner extension that enables you to design, "
            "create, and distribute reports in minutes."
        ),
        "bq_main_topic": "Mail & Deploy automated reporting from Qlik Sense and QlikView",
        "bq_keywords": [
            {"term": "Mail & Deploy", "importance": "1.0"},
            {"term": "automated reporting Qlik", "importance": "0.95"},
            {"term": "Qlik NPrinting alternative", "importance": "0.9"},
            {"term": "Qlik Sense reporting", "importance": "0.88"},
            {"term": "centralised reporting", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Mail & Deploy", "type": "product", "importance": "1.0"},
            {"name": "Qlik", "type": "product", "importance": "0.9"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/mail-deploy-automated-reporting/",
            "Mail & Deploy",
            (
                "Mail & Deploy is a Qlik Technology Partner extension that enables "
                "you to design, create, and distribute reports in minutes from "
                "QlikView and Qlik Sense. It ensures that managers and stakeholders "
                "receive up-to-date and easily digestible insights in any format: "
                "PowerPoint, Excel, Word, HTML, CSV, or PDF. A proven alternative "
                "for Qlik NPrinting when migrating from on-premises to Qlik Sense SaaS."
            ),
            "BusinessApplication",
            "Mail & Deploy, automated reporting Qlik, Qlik NPrinting alternative, "
            "Qlik Sense reporting, centralised reporting, PowerPoint PDF Excel",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/planacy/",
        "page_title": "Planacy – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Planacy is the platform that makes budgeting, forecasting, and planning "
            "easy. Fully customisable to your needs and seamlessly integrated with "
            "your existing systems — so you can get more value from your budget in "
            "less time. Climber is a Planacy Solution Partner since 2020."
        ),
        "bq_main_topic": "Planacy — FP&A budgeting and forecasting platform",
        "bq_keywords": [
            {"term": "Planacy", "importance": "1.0"},
            {"term": "budgeting forecasting planning", "importance": "0.95"},
            {"term": "FP&A", "importance": "0.9"},
            {"term": "rolling forecast", "importance": "0.88"},
            {"term": "financial planning", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Planacy", "type": "product", "importance": "1.0"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.95"},
            {"name": "Qlik", "type": "product", "importance": "0.8"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/planacy/",
            "Planacy",
            (
                "Planacy is the platform that makes budgeting, forecasting, and "
                "planning easy. Fully customisable and seamlessly integrated with "
                "your existing systems, including Qlik. Planacy reduces time spent "
                "on manual and administrative tasks in budget and planning processes, "
                "freeing up time for more strategic work. With integration to Qlik, "
                "you get quality-assured data directly in the platform and avoid "
                "manual work with Excel sheets. Climber is a Planacy Solution Partner "
                "since 2020."
            ),
            "BusinessApplication",
            "Planacy, budgeting forecasting planning, FP&A, rolling forecast, "
            "financial planning, Qlik integration, scenario planning",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/microsoft-power-bi/",
        "page_title": "Microsoft Power BI – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Microsoft Power BI is a powerful Business Intelligence tool designed to "
            "help organisations visualise data, uncover insights, and make data-driven "
            "decisions. With its user-friendly interface and robust analytics "
            "capabilities, Power BI transforms complex data into meaningful reports "
            "and interactive dashboards."
        ),
        "bq_main_topic": "Microsoft Power BI — Business Intelligence and data visualisation",
        "bq_keywords": [
            {"term": "Microsoft Power BI", "importance": "1.0"},
            {"term": "Power BI", "importance": "0.95"},
            {"term": "data visualisation", "importance": "0.9"},
            {"term": "Microsoft Fabric", "importance": "0.88"},
            {"term": "Power Platform", "importance": "0.85"}
        ],
        "bq_entities": [
            {"name": "Microsoft Power BI", "type": "product", "importance": "1.0"},
            {"name": "Microsoft", "type": "organization", "importance": "0.9"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/microsoft-power-bi/",
            "Microsoft Power BI",
            (
                "Microsoft Power BI is a powerful Business Intelligence tool designed "
                "to help organisations visualise data, uncover insights, and make "
                "data-driven decisions. Available as a SaaS option in Azure Cloud or "
                "as on-premises Power BI Report Server. Core component of Microsoft "
                "Power Platform and Microsoft Fabric, enabling an end-to-end data "
                "experience with advanced AI-powered analytics, real-time monitoring, "
                "and seamless collaboration via Teams and SharePoint."
            ),
            "BusinessApplication",
            "Microsoft Power BI, Power BI, data visualisation, Microsoft Fabric, "
            "Power Platform, AI-powered analytics, interactive dashboards",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/qlik-cloud-data-integration/",
        "page_title": "Qlik Cloud Data Integration – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Qlik Cloud Data Integration (QCDI) helps you deliver, transform, and "
            "unify enterprise data in real-time to any cloud platform. QCDI enables "
            "seamless replication of data from on-premises or cloud sources without "
            "the need to write complex code."
        ),
        "bq_main_topic": "Qlik Cloud Data Integration — real-time data replication",
        "bq_keywords": [
            {"term": "Qlik Cloud Data Integration", "importance": "1.0"},
            {"term": "QCDI", "importance": "0.95"},
            {"term": "real-time data replication", "importance": "0.9"},
            {"term": "data pipeline", "importance": "0.88"},
            {"term": "Qlik Catalog", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Qlik Cloud Data Integration", "type": "product", "importance": "1.0"},
            {"name": "Qlik", "type": "organization", "importance": "0.95"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/qlik-cloud-data-integration/",
            "Qlik Cloud Data Integration",
            (
                "Qlik Cloud Data Integration (QCDI) helps you deliver, transform, "
                "and unify enterprise data in real-time to any cloud platform. "
                "Seamlessly replicate data from on-premises or cloud sources into "
                "Qlik Cloud and leading platforms like Snowflake, Azure Synapse, "
                "Google BigQuery, and Databricks — without writing complex code. "
                "Includes Qlik Catalog and Data Lineage for full data governance "
                "and understanding of your data estate."
            ),
            "BusinessApplication",
            "Qlik Cloud Data Integration, QCDI, real-time data replication, "
            "data pipeline, Qlik Catalog, Snowflake Azure BigQuery Databricks",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/qlik-data-integration/",
        "page_title": "Qlik Data Integration – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Qlik Data Integration keeps you one step ahead, giving you the most "
            "recent data available, analytics-ready, without dependency on developers. "
            "A unified platform covering data ingestion, replication, data warehouse "
            "automation, and cataloging."
        ),
        "bq_main_topic": "Qlik Data Integration — unified data pipeline platform",
        "bq_keywords": [
            {"term": "Qlik Data Integration", "importance": "1.0"},
            {"term": "QDI", "importance": "0.92"},
            {"term": "Qlik Replicate", "importance": "0.9"},
            {"term": "Change Data Capture", "importance": "0.88"},
            {"term": "data warehouse automation", "importance": "0.85"}
        ],
        "bq_entities": [
            {"name": "Qlik Data Integration", "type": "product", "importance": "1.0"},
            {"name": "Qlik Replicate", "type": "product", "importance": "0.9"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/qlik-data-integration/",
            "Qlik Data Integration",
            (
                "Qlik Data Integration (QDI) keeps you one step ahead, giving you "
                "the most recent data available, analytics-ready, without dependency "
                "of developers. The platform provides all tools needed to set up a "
                "real-time Data Pipeline — Qlik Replicate for universal data "
                "replication using Change Data Capture (CDC), Qlik Compose for "
                "automated data warehouse and data lake automation, and Qlik Data "
                "Catalog for self-service analytics and data lineage."
            ),
            "BusinessApplication",
            "Qlik Data Integration, Qlik Replicate, Change Data Capture CDC, "
            "data warehouse automation, Qlik Compose, Qlik Catalog, data pipeline",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/qlik-automate/",
        "page_title": "Qlik Automate – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "With Qlik Automate you can create integrated workflows through a simple "
            "drag and drop experience to make quicker, better-informed decisions and "
            "free up time by automating administrative tasks. A no-code visual "
            "interface for building automated workflows between cloud and on-premise "
            "enterprise applications."
        ),
        "bq_main_topic": "Qlik Automate — no-code workflow automation",
        "bq_keywords": [
            {"term": "Qlik Automate", "importance": "1.0"},
            {"term": "no-code workflow automation", "importance": "0.95"},
            {"term": "Application Automation", "importance": "0.9"},
            {"term": "Qlik Cloud platform", "importance": "0.88"},
            {"term": "drag and drop workflows", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Qlik Automate", "type": "product", "importance": "1.0"},
            {"name": "Qlik", "type": "organization", "importance": "0.95"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/qlik-automate/",
            "Qlik Automate",
            (
                "With Qlik Automate (formerly Application Automation) you can create "
                "integrated workflows through a simple drag and drop experience — "
                "making quicker, better-informed decisions and automating administrative "
                "tasks. A no-code visual interface for building automated workflows "
                "between cloud and on-premise enterprise applications such as HubSpot, "
                "Salesforce, GitHub, and Microsoft Office 365. Automate KPI-triggered "
                "alerts, SaaS integrations, and Qlik Cloud platform administration."
            ),
            "BusinessApplication",
            "Qlik Automate, no-code workflow automation, Application Automation, "
            "Qlik Cloud, drag and drop, HubSpot Salesforce GitHub, KPI alerts",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/talend/",
        "page_title": "Talend Data Management – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Talend is a modular, self-service, end-to-end management platform that "
            "connects data from any source to any destination. Part of Qlik since 2023. "
            "Talend Data Fabric combines Data Integration, Data Governance and API "
            "Integration with over 900 connectors."
        ),
        "bq_main_topic": "Talend data management and integration platform",
        "bq_keywords": [
            {"term": "Talend", "importance": "1.0"},
            {"term": "Talend Data Fabric", "importance": "0.95"},
            {"term": "data integration platform", "importance": "0.9"},
            {"term": "Talend Trust Score", "importance": "0.88"},
            {"term": "data governance", "importance": "0.85"}
        ],
        "bq_entities": [
            {"name": "Talend", "type": "product", "importance": "1.0"},
            {"name": "Talend Data Fabric", "type": "product", "importance": "0.95"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/talend/",
            "Talend",
            (
                "Talend is a modular, self-service, end-to-end management platform "
                "that connects data from any source to any destination. Part of Qlik "
                "since 2023. Talend Data Fabric combines Data Integration, Data "
                "Governance and API Integration with over 900 connectors. The Talend "
                "Trust Score provides an assessment of your data's health — its "
                "quality, relevance, and popularity. Climber is a Gold Value Added "
                "Reseller."
            ),
            "BusinessApplication",
            "Talend, Talend Data Fabric, data integration platform, "
            "Talend Trust Score, data governance, ETL, 900 connectors",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/snowflake-ai-data-cloud/",
        "page_title": "Snowflake AI Data Cloud – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "The Snowflake AI Data Cloud removes silos, creating a single, seamless "
            "data foundation that helps businesses collaborate, develop AI-driven "
            "data applications, and gain valuable insights. A managed platform that "
            "adapts to your business and teams."
        ),
        "bq_main_topic": "Snowflake AI Data Cloud — unified data platform",
        "bq_keywords": [
            {"term": "Snowflake AI Data Cloud", "importance": "1.0"},
            {"term": "Snowflake", "importance": "0.95"},
            {"term": "data cloud", "importance": "0.9"},
            {"term": "data silos", "importance": "0.88"},
            {"term": "AI data platform", "importance": "0.85"}
        ],
        "bq_entities": [
            {"name": "Snowflake AI Data Cloud", "type": "product", "importance": "1.0"},
            {"name": "Snowflake", "type": "organization", "importance": "0.95"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/snowflake-ai-data-cloud/",
            "Snowflake AI Data Cloud",
            (
                "The Snowflake AI Data Cloud removes silos, creating a single, "
                "seamless data foundation that helps businesses collaborate, develop "
                "AI-driven data applications, and gain valuable insights. A managed "
                "platform that adapts to your business — separating storage and "
                "compute for independent scaling, supporting real-time analytics, "
                "machine learning, and secure data sharing across AWS, Azure, and "
                "Google Cloud."
            ),
            "BusinessApplication",
            "Snowflake AI Data Cloud, Snowflake, data cloud, data silos, "
            "AI data platform, real-time analytics, machine learning",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/software/microsoft-fabric/",
        "page_title": "Microsoft Fabric – Climber Nederland",
        "page_type": "software",
        "primary_schema": "SoftwareApplication",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Microsoft Fabric is an all-in-one data platform that covers everything "
            "from data storage and data movement to data science, real-time analytics, "
            "and business intelligence. One unified solution — one truth, one platform, "
            "one supplier, one price."
        ),
        "bq_main_topic": "Microsoft Fabric — unified end-to-end data and analytics platform",
        "bq_keywords": [
            {"term": "Microsoft Fabric", "importance": "1.0"},
            {"term": "unified data platform", "importance": "0.95"},
            {"term": "OneLake", "importance": "0.9"},
            {"term": "Azure Synapse", "importance": "0.88"},
            {"term": "Power BI Fabric", "importance": "0.85"}
        ],
        "bq_entities": [
            {"name": "Microsoft Fabric", "type": "product", "importance": "1.0"},
            {"name": "Microsoft", "type": "organization", "importance": "0.9"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(software(
            "https://www.climber.nl/onze-diensten/software/microsoft-fabric/",
            "Microsoft Fabric",
            (
                "Microsoft Fabric is an all-in-one data platform covering data "
                "storage, data movement, data science, real-time analytics, and "
                "business intelligence. Built on SaaS, it brings together Azure "
                "Data Factory, Azure Synapse, and Power BI in one unified solution. "
                "One truth, one platform, one supplier, one price. Includes OneLake, "
                "Data Factory, Synapse Data Engineering, Synapse Data Warehouse, "
                "and Synapse Real Time Analytics."
            ),
            "BusinessApplication",
            "Microsoft Fabric, unified data platform, OneLake, Azure Synapse, "
            "Power BI, Azure Data Factory, real-time analytics, data science",
            lang="en"
        ))
    },

    # ── CASES ─────────────────────────────────────────────────────────────────

    {
        "url": "https://www.climber.nl/onze-diensten/onze-cases/",
        "page_title": "Onze Cases – Climber Nederland",
        "page_type": "cases",
        "primary_schema": "CollectionPage",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Geen dag is hetzelfde bij Climber. Sinds onze start in 2007 hielpen we "
            "met plezier ruim 400 bedrijven in uiteenlopende branches. Ons team "
            "bouwde voor diverse bedrijfsvraagstukken meer dan 500 oplossingen."
        ),
        "bq_main_topic": "Klantcases en referenties van Climber Nederland",
        "bq_keywords": [
            {"term": "klantcases", "importance": "1.0"},
            {"term": "Business Intelligence cases", "importance": "0.95"},
            {"term": "Qlik referenties", "importance": "0.9"},
            {"term": "Climber Nederland", "importance": "0.88"},
            {"term": "400 bedrijven", "importance": "0.8"}
        ],
        "bq_entities": [
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "ASICS", "type": "organization", "importance": "0.85"},
            {"name": "Jan Krediet", "type": "organization", "importance": "0.82"}
        ],
        "schema_fn": lambda: build_schema_body(collection_page(
            "https://www.climber.nl/onze-diensten/onze-cases/",
            "Onze Cases – Climber Nederland",
            (
                "Geen dag is hetzelfde bij Climber. Sinds onze start in 2007 "
                "hielpen we met plezier ruim 400 bedrijven in uiteenlopende "
                "branches. Ons team van bouwkundigen, economen en "
                "systeemwetenschappers — allemaal Qlik specialisten — bouwde "
                "voor diverse bedrijfsvraagstukken meer dan 500 oplossingen. "
                "Klanten als ASICS, Jan Krediet en WILDLANDS tonen hoe "
                "Climber waarde toevoegt aan de business."
            ),
            "klantcases, Business Intelligence cases, Qlik referenties, "
            "Climber Nederland, 400 bedrijven, 500 oplossingen",
            lang="nl"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/onze-cases/branche-uitgelicht-dagattracties/",
        "page_title": "Branche Uitgelicht: Dagattracties – Climber Nederland",
        "page_type": "cases",
        "primary_schema": "Article",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Dagrecreatie en dagattracties — pretparken, dierentuinen en musea — "
            "staan voor grote uitdagingen in een markt waar bezoekers oneindig veel "
            "keuze hebben. Business Intelligence helpt dagattracties om data gedreven "
            "te sturen op bezoekersaantallen, marges en gastwaardering."
        ),
        "bq_main_topic": "Business Intelligence voor de dagattractie-branche",
        "bq_keywords": [
            {"term": "dagattracties", "importance": "1.0"},
            {"term": "dagrecreatie Business Intelligence", "importance": "0.95"},
            {"term": "attractieparken data analyse", "importance": "0.9"},
            {"term": "WILDLANDS", "importance": "0.88"},
            {"term": "bezoekersdata", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "WILDLANDS Adventure Zoo Emmen", "type": "organization", "importance": "0.95"},
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "dagattracties", "type": "sector", "importance": "1.0"}
        ],
        "schema_fn": lambda: build_schema_body(article(
            "https://www.climber.nl/onze-diensten/onze-cases/branche-uitgelicht-dagattracties/",
            "Branche Uitgelicht: Dagattracties",
            (
                "Jaarlijks trekt de top 50 van de dagattractie branche meer dan "
                "50 miljoen bezoekers. Business Intelligence helpt dagattracties "
                "om data gedreven te sturen op bezoekersaantallen, marges en "
                "gastwaardering. WILDLANDS Adventure Zoo Emmen is in 2019 begonnen "
                "met datagedreven werken en toont hoe BI-tools teams minder tijd "
                "laten besteden aan het achterhalen van inzichten en meer aan het "
                "verhogen van conversie en klantwaarde."
            ),
            "dagattracties, dagrecreatie, attractieparken, dierentuinen, musea, "
            "Business Intelligence, bezoekersdata, WILDLANDS, Qlik",
            about="Business Intelligence voor dagattractie-branche",
            lang="nl"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/onze-cases/get-a-360-on-your-finances-with-qlik/",
        "page_title": "Get a 360° on Your Finances with Qlik – Climber Nederland",
        "page_type": "cases",
        "primary_schema": "Article",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Climber's complete, Qlik-based solution for the finance department gives "
            "CFOs and Business Controllers deeper insight into business data, greater "
            "confidence in decisions, and a 360° near real-time overview of finances — "
            "replacing static ERP reports with dynamic, drillable dashboards."
        ),
        "bq_main_topic": "Qlik finance solution — 360 degree view of your finances",
        "bq_keywords": [
            {"term": "360 finance Qlik", "importance": "1.0"},
            {"term": "CFO Business Controller", "importance": "0.95"},
            {"term": "finance BI solution", "importance": "0.9"},
            {"term": "ERP reporting replacement", "importance": "0.88"},
            {"term": "P&L dashboard", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "Qlik", "type": "product", "importance": "0.95"},
            {"name": "finance department", "type": "concept", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(article(
            "https://www.climber.nl/onze-diensten/onze-cases/get-a-360-on-your-finances-with-qlik/",
            "Get a 360° on Your Finances with Qlik",
            (
                "As CFO or Business Controller, your role has evolved from scorekeeper "
                "to strategic advisor. Climber's complete, Qlik-based finance solution "
                "gives you all key metrics in one place — a 360°, near real-time "
                "snapshot of critical business data. Automatically collects information "
                "from all existing sources, consolidates reports across offices, "
                "currencies, and systems, and enables P&L with comments, cash flow, "
                "and balance sheet — so you can act as advisor to the business, not "
                "number cruncher."
            ),
            "360 finance Qlik, CFO Business Controller, finance BI solution, "
            "ERP reporting, P&L dashboard, cash flow, management accounting",
            about="Qlik-based finance solution for CFOs and Business Controllers",
            lang="en"
        ))
    },

    {
        "url": "https://www.climber.nl/onze-diensten/onze-cases/logistiek/",
        "page_title": "Data-gedreven Logistiek – Climber Nederland",
        "page_type": "cases",
        "primary_schema": "Article",
        "secondary_schemas": ["Organization"],
        "content_summary": (
            "Van data overload naar informatie-gedreven sturing dat orde schept en "
            "je helpt duurzaam te groeien. Business Intelligence voor logistieke "
            "organisaties: één versie van de waarheid voor commercie, operatie en "
            "finance."
        ),
        "bq_main_topic": "Business Intelligence voor logistieke organisaties",
        "bq_keywords": [
            {"term": "data-gedreven logistiek", "importance": "1.0"},
            {"term": "logistiek Business Intelligence", "importance": "0.95"},
            {"term": "één versie van de waarheid", "importance": "0.9"},
            {"term": "Jan Krediet", "importance": "0.88"},
            {"term": "data platform logistiek", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Jan Krediet", "type": "organization", "importance": "0.95"},
            {"name": "Climber Nederland", "type": "organization", "importance": "1.0"},
            {"name": "logistiek", "type": "sector", "importance": "1.0"}
        ],
        "schema_fn": lambda: build_schema_body(article(
            "https://www.climber.nl/onze-diensten/onze-cases/logistiek/",
            "Data-gedreven Logistiek – Climber Nederland",
            (
                "Van data overload naar informatie-gedreven sturing dat orde schept "
                "en je helpt duurzaam te groeien. Door stijgende kosten, complexe "
                "operaties en stevige concurrentie staan marges onder druk. De "
                "oplossing ligt in de combinatie van je data en de kennis van je "
                "mensen om tot data-gedreven acties te komen die processen verbeteren. "
                "Klantcase: Jan Krediet — van fragmentatie naar één data-gedreven "
                "waarheid die commercie, operatie en finance verbindt."
            ),
            "data-gedreven logistiek, logistiek Business Intelligence, "
            "één versie van de waarheid, Jan Krediet, data platform, "
            "operationele efficiëntie, margeverbetering",
            about="Business Intelligence voor logistieke organisaties",
            lang="nl"
        ))
    },

    # ── FAQ PAGES (English) ───────────────────────────────────────────────────

    {
        "url": "https://www.climber.nl/data-warehouses-and-data-lakes-faq/",
        "page_title": "Data Warehouses and Data Lakes FAQ – Climber Nederland",
        "page_type": "faq",
        "primary_schema": "FAQPage",
        "secondary_schemas": [],
        "content_summary": (
            "Climber's FAQ on Data Warehouses and Data Lakes answers common questions "
            "about modern data platforms — differences, benefits, components, and how "
            "data warehouses and data lakes work together to support reporting, "
            "analytics, AI, and machine learning."
        ),
        "bq_main_topic": "Data warehouses and data lakes — frequently asked questions",
        "bq_keywords": [
            {"term": "data warehouse", "importance": "1.0"},
            {"term": "data lake", "importance": "0.95"},
            {"term": "data platform", "importance": "0.9"},
            {"term": "Lakehouse", "importance": "0.88"},
            {"term": "ETL ELT", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "data warehouse", "type": "concept", "importance": "1.0"},
            {"name": "data lake", "type": "concept", "importance": "1.0"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(faq([
            (
                "What is a data warehouse?",
                "A data warehouse is a centralised data platform designed to support "
                "business intelligence, reporting, and analytics. It brings together "
                "structured data from systems such as ERP, CRM, and HR platforms into "
                "a single, consistent environment. Data is cleaned, organised, and "
                "structured before it is used, making it suitable for complex queries "
                "and historical analysis."
            ),
            (
                "What is a data lake?",
                "A data lake is a centralised storage environment designed to hold large "
                "volumes of data in its raw or native format. Unlike a data warehouse, "
                "it can store structured, semi-structured, and unstructured data without "
                "requiring transformation before it is stored. Data lakes use a "
                "'schema-on-read' approach, making them well suited to exploratory "
                "analytics, data science, machine learning, and AI use cases."
            ),
            (
                "What is the difference between a data warehouse and a data lake?",
                "The key difference lies in how data is structured and processed. A "
                "data warehouse uses a schema-on-write approach — data is cleaned, "
                "transformed, and structured before it is loaded. A data lake uses a "
                "schema-on-read approach, storing data in its raw format and applying "
                "structure only when it is analysed. Data warehouses are used for "
                "business intelligence and trusted reporting; data lakes for exploratory "
                "analytics, data science, and AI."
            ),
            (
                "What are the benefits of a data warehouse?",
                "A data warehouse improves data quality and consistency by consolidating "
                "information from multiple systems into a governed environment. It "
                "preserves historical data for trend analysis and performance measurement, "
                "enables complex queries and reliable reports, and supports modern cloud "
                "analytics and AI use cases."
            ),
            (
                "Can a data lake replace a data warehouse?",
                "Although a data lake can support some analytical workloads, it does not "
                "replace the structured role of a data warehouse. Many organisations "
                "adopt a hybrid 'Lakehouse' approach — combining the flexibility of a "
                "data lake with the governance and performance of a data warehouse — "
                "so raw data is retained for exploration while curated data supports "
                "trusted reporting."
            ),
        ], lang="en"))
    },

    {
        "url": "https://www.climber.nl/data-integration-faq/",
        "page_title": "Data Integration FAQ – Climber Nederland",
        "page_type": "faq",
        "primary_schema": "FAQPage",
        "secondary_schemas": [],
        "content_summary": (
            "Climber's Data Integration FAQ answers common questions about what data "
            "integration is, how it works, types of integration (ETL, ELT, CDC, "
            "streaming), and tools used — helping organisations build accurate, "
            "trusted insights."
        ),
        "bq_main_topic": "Data integration — frequently asked questions",
        "bq_keywords": [
            {"term": "data integration", "importance": "1.0"},
            {"term": "ETL ELT", "importance": "0.95"},
            {"term": "Change Data Capture CDC", "importance": "0.9"},
            {"term": "data consolidation", "importance": "0.88"},
            {"term": "data harmonisation", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "data integration", "type": "concept", "importance": "1.0"},
            {"name": "Change Data Capture", "type": "concept", "importance": "0.9"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(faq([
            (
                "What is meant by data integration?",
                "Data integration is the process of combining information from multiple "
                "systems into a single, consistent view. This allows organisations to "
                "analyse performance more effectively and gain clearer operational "
                "insight. The aim is to make data accessible, reliable, and usable for "
                "reporting and decision-making, regardless of where it originates."
            ),
            (
                "What is data integration in simple words?",
                "Data integration is the process of bringing scattered pieces of "
                "information together so they can be used in one place. Instead of "
                "disconnected datasets, organisations can see the full picture and "
                "make more informed decisions."
            ),
            (
                "What exactly is data integration?",
                "Data integration is the set of technical and business processes "
                "required to access, cleanse, transform, and move data from different "
                "sources into a target environment such as a data warehouse or data "
                "lake. These processes ensure data is consistent, accurate, and ready "
                "for analysis."
            ),
            (
                "What is another name for data integration?",
                "Another name for data integration is data consolidation. Related terms "
                "include data unification and data harmonisation. While closely linked, "
                "each typically describes a specific aspect of the broader integration "
                "process."
            ),
            (
                "Are there different types of data integration?",
                "Data integration can be approached in several ways: data consolidation "
                "(collecting data from multiple systems into a central repository using "
                "batch ETL or ELT), data replication (copying data between systems), "
                "Change Data Capture / CDC (capturing only data changes for near "
                "real-time updates), and data streaming (processing data continuously "
                "as events occur for real-time analytics)."
            ),
        ], lang="en"))
    },

    {
        "url": "https://www.climber.nl/qlik-sense-faq/",
        "page_title": "Qlik Sense FAQ – Climber Nederland",
        "page_type": "faq",
        "primary_schema": "FAQPage",
        "secondary_schemas": [],
        "content_summary": (
            "Climber's FAQ on Qlik Sense and QlikView covers functionality, pricing, "
            "how the tools work, comparisons with Tableau and Power BI, and how to "
            "migrate from QlikView to Qlik Sense."
        ),
        "bq_main_topic": "Qlik Sense FAQ — functionality, pricing, and comparison",
        "bq_keywords": [
            {"term": "Qlik Sense FAQ", "importance": "1.0"},
            {"term": "Qlik Sense pricing", "importance": "0.95"},
            {"term": "QlikView vs Qlik Sense", "importance": "0.9"},
            {"term": "Associative Engine", "importance": "0.88"},
            {"term": "Qlik Cloud", "importance": "0.85"}
        ],
        "bq_entities": [
            {"name": "Qlik Sense", "type": "product", "importance": "1.0"},
            {"name": "QlikView", "type": "product", "importance": "0.9"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(faq([
            (
                "What does Qlik Sense cost?",
                "Qlik Sense is offered in two license models: user-based pricing with "
                "Professional Users and Analyzer Users (including Analyzer Capacity "
                "Minutes), and Data Capacity where customers purchase gigabyte capacity "
                "packs consumed based on 'Data Analysed'. Contact Climber for an exact "
                "quote."
            ),
            (
                "How does Qlik Sense work?",
                "Qlik Sense is a data analysis and visualisation tool that collects and "
                "analyses data from various sources. With Qlik's Associative Engine you "
                "can explore data and discover insights that traditional tools often miss "
                "— the 'power of Green, White, and Grey': what is selected (green), "
                "what is related (white), and what is NOT connected (grey)."
            ),
            (
                "What is the difference between QlikView and Qlik Sense?",
                "Qlik Sense is the newer modern product with more appealing visualisation "
                "possibilities, a responsive interface, and open APIs that enable "
                "extensions like Vizlib. QlikView focuses on traditional reports and "
                "dashboards through guided analytics. New customers can no longer "
                "purchase QlikView licences."
            ),
            (
                "Is Qlik Sense an ETL tool?",
                "Qlik Sense is primarily a data analysis and visualisation tool, but it "
                "has some ETL (Extract, Transform, Load) functionality. It can extract "
                "data from various sources and prepare it for analysis, but is not as "
                "powerful as dedicated ETL tools like Qlik Talend Cloud."
            ),
            (
                "What is the difference between Qlik Sense and Qlik Cloud?",
                "Qlik Sense is the data analysis and visualisation tool. Qlik Cloud is "
                "the cloud platform that offers Qlik Sense as a SaaS service — fully "
                "hosted by Qlik, accessible via the internet, no local software "
                "installation required, and constantly updated with the latest "
                "functionality."
            ),
        ], lang="en"))
    },

    {
        "url": "https://www.climber.nl/microsoft-fabric-faq/",
        "page_title": "Microsoft Fabric FAQ – Climber Nederland",
        "page_type": "faq",
        "primary_schema": "FAQPage",
        "secondary_schemas": [],
        "content_summary": (
            "Climber's FAQ on Microsoft Fabric covers functionality, pricing, "
            "governance, AI integration, migration approach, and how Fabric "
            "compares to existing data platforms — helping organisations understand "
            "when and how to adopt it."
        ),
        "bq_main_topic": "Microsoft Fabric FAQ — frequently asked questions",
        "bq_keywords": [
            {"term": "Microsoft Fabric FAQ", "importance": "1.0"},
            {"term": "Microsoft Fabric", "importance": "0.95"},
            {"term": "Fabric vs data warehouse", "importance": "0.9"},
            {"term": "Fabric AI initiatives", "importance": "0.88"},
            {"term": "OneLake", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Microsoft Fabric", "type": "product", "importance": "1.0"},
            {"name": "Microsoft", "type": "organization", "importance": "0.9"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(faq([
            (
                "What is Microsoft Fabric?",
                "Microsoft Fabric is Microsoft's end-to-end data and analytics platform "
                "that brings data engineering, data science, real-time analytics, and "
                "Microsoft Power BI into one unified environment."
            ),
            (
                "How is Microsoft Fabric different from our existing data platform?",
                "It replaces multiple disconnected tools with a single, integrated "
                "workspace so teams stop juggling services and start producing insights "
                "faster."
            ),
            (
                "Do we need to migrate everything at once?",
                "No. Microsoft Fabric supports phased adoption, letting you run existing "
                "systems while gradually moving workloads."
            ),
            (
                "Is Microsoft Fabric suitable for small and mid-size businesses?",
                "Yes. It scales up or down, and you only pay for the capacity you use."
            ),
            (
                "How does Microsoft Fabric help with AI initiatives?",
                "It connects structured data, unstructured data, and machine-learning "
                "tools in one ecosystem, making AI projects easier to deploy and scale."
            ),
            (
                "Does Microsoft Fabric remove the need for a data warehouse?",
                "Not exactly. Microsoft Fabric gives you a lakehouse and data warehouse "
                "side-by-side, so you choose the right storage for each workload."
            ),
            (
                "How long does it take to get value from Microsoft Fabric?",
                "Most organisations see useful results within weeks — ingest data, build "
                "a lakehouse, publish dashboards, repeat."
            ),
        ], lang="en"))
    },

    {
        "url": "https://www.climber.nl/microsoft-power-bi-faq/",
        "page_title": "Microsoft Power BI FAQ – Climber Nederland",
        "page_type": "faq",
        "primary_schema": "FAQPage",
        "secondary_schemas": [],
        "content_summary": (
            "Climber's FAQ on Microsoft Power BI covers functionality, licensing, "
            "data sources, real-time analysis, customisation, and how Power BI "
            "integrates with Microsoft Fabric and the Power Platform."
        ),
        "bq_main_topic": "Microsoft Power BI FAQ — frequently asked questions",
        "bq_keywords": [
            {"term": "Microsoft Power BI FAQ", "importance": "1.0"},
            {"term": "Power BI licensing", "importance": "0.95"},
            {"term": "Power BI Pro Premium", "importance": "0.9"},
            {"term": "Power BI data sources", "importance": "0.88"},
            {"term": "Power BI vs Power Platform", "importance": "0.82"}
        ],
        "bq_entities": [
            {"name": "Microsoft Power BI", "type": "product", "importance": "1.0"},
            {"name": "Power BI Pro", "type": "product", "importance": "0.9"},
            {"name": "Climber Nederland", "type": "organization", "importance": "0.88"}
        ],
        "schema_fn": lambda: build_schema_body(faq([
            (
                "What is Microsoft Power BI, and how can it benefit my business?",
                "Power BI is a business analytics service by Microsoft that provides "
                "interactive visualisations and business intelligence capabilities. "
                "All the most successful businesses today are data-led organisations "
                "where decisions are taken using data — Power BI is designed for "
                "exactly that. It empowers colleagues to get the answers they need "
                "without relying on a dedicated data analysis team."
            ),
            (
                "Why should I use Power BI?",
                "Power BI allows for the easy development of reports using hundreds of "
                "built-in connectors to connect to almost any data source. The license "
                "costs are low, and Power BI's tight integration into the Microsoft "
                "universe — from Office to Fabric to Power Platform — gives great "
                "flexibility and makes it an excellent choice for small, medium, and "
                "large businesses."
            ),
            (
                "What are the components of Power BI?",
                "Power BI consists of the Power BI Desktop App for designing reports, "
                "the Power BI Service for hosting reports, and Power BI Mobile "
                "(available on Android and iOS) for viewing reports on mobile devices. "
                "Some organisations use Power BI Report Server in place of the "
                "cloud-based Power BI Service."
            ),
            (
                "What's the difference between Power BI Pro and Power BI Premium?",
                "Power BI Pro is intended for smaller businesses with lower data and "
                "storage requirements, limited to 8 refreshes per day. Power BI Premium "
                "per user offers 10x more space for datasets and storage and 48 "
                "refreshes per day. Fabric licenses include access to a host of data "
                "tools including Power BI."
            ),
            (
                "What data sources can Power BI connect to?",
                "Power BI can connect to over 150 different data sources using dedicated "
                "connectors, plus generic connectors for CSV, ODBC, JSON, and XML. "
                "This means Power BI can connect to almost any data source."
            ),
            (
                "Can we use Power BI for real-time data analysis?",
                "Power BI supports direct query mode for real-time system queries. With "
                "data stored in a Fabric Lakehouse, direct Lake mode also offers "
                "real-time analysis. Even in import mode, with up to 48 queries per "
                "day, data is at most 30 minutes out of date — sufficient for all but "
                "the most stringent real-time requirements."
            ),
        ], lang="en"))
    },

]


# ─── SCHEMA BUILDER ──────────────────────────────────────────────────────────
# Called at runtime per page so failures are isolated.

def build_page_schema(p):
    """Call build_schema_body on the page's lazy schema_fn if present."""
    if "schema_fn" in p:
        return build_schema_body(p["schema_fn"]())
    return p.get("schema_body", "")


# ─── MONGO: SAVE ONE PAGE ─────────────────────────────────────────────────────

def save_one(col, p, force=False):
    """
    Upsert a single page document into MongoDB.
    Returns 'inserted', 'updated', or 'skipped'.
    """
    existing = col.find_one({"url": p["url"]}, {"_id": 1, "schema_body": 1})
    if existing and not force:
        # Skip if already has a non-empty schema_body
        if existing.get("schema_body"):
            return "skipped"

    now = datetime.now(timezone.utc)
    schema_body = build_page_schema(p)

    doc = {
        "client_id": CLIENT_ID,
        "domain": DOMAIN,
        "url": p["url"],
        "page_title": p["page_title"],
        "page_type": p["page_type"],
        "primary_schema": p["primary_schema"],
        "secondary_schemas": p["secondary_schemas"],
        "content_summary": p["content_summary"],
        "bq_main_topic": p["bq_main_topic"],
        "bq_keywords": p["bq_keywords"],
        "bq_entities": p["bq_entities"],
        "schema_body": schema_body,
        "status": "draft",
        "updated_at": now,
    }
    if not existing:
        doc["created_at"] = now

    result = col.update_one({"url": p["url"]}, {"$set": doc}, upsert=True)
    return "inserted" if result.upserted_id else "updated"


# ─── MAIN LOOP ────────────────────────────────────────────────────────────────

def run(pages, drop=False, force=False, url_filter=None):
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("ERROR: MONGO_URI not set in .env")
        sys.exit(1)

    client = MongoClient(mongo_uri)
    col = client["task-manager"][COLLECTION]

    if drop:
        col.drop()
        print(f"🗑️  Dropped {COLLECTION}\n")

    if url_filter:
        pages = [p for p in pages if p["url"] == url_filter]
        if not pages:
            print(f"ERROR: No page found for URL: {url_filter}")
            sys.exit(1)

    counts = {"inserted": 0, "updated": 0, "skipped": 0, "failed": 0}
    total = len(pages)

    print(f"Processing {total} page(s)...\n")

    for i, p in enumerate(pages, 1):
        slug = p["url"].replace("https://www.climber.nl", "")
        prefix = f"[{i:02d}/{total}]"
        try:
            outcome = save_one(col, p, force=force)
            counts[outcome] += 1
            icon = {"inserted": "✅", "updated": "🔄", "skipped": "⏭️ "}[outcome]
            print(f"  {icon} {prefix} [{p['primary_schema']:<20}] {slug}")
        except Exception as e:
            counts["failed"] += 1
            print(f"  ❌ {prefix} [{p['primary_schema']:<20}] {slug}")
            print(f"       Error: {e}")
            # Continue with the next page — don't abort the run

    client.close()

    print(f"\n{'='*60}")
    print(f"  ✅ Inserted : {counts['inserted']}")
    print(f"  🔄 Updated  : {counts['updated']}")
    print(f"  ⏭️  Skipped  : {counts['skipped']}  (already saved — use --force to overwrite)")
    print(f"  ❌ Failed   : {counts['failed']}")
    print(f"  Collection  : {COLLECTION}")

    if counts["failed"]:
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate and save climber.nl JSON-LD schemas to MongoDB"
    )
    parser.add_argument("--drop",  action="store_true",
                        help="Drop collection before processing")
    parser.add_argument("--force", action="store_true",
                        help="Overwrite pages that are already saved")
    parser.add_argument("--url",   default=None,
                        help="Process a single URL only")
    args = parser.parse_args()

    run(PAGES, drop=args.drop, force=args.force, url_filter=args.url)
