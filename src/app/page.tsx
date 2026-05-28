"use client";
/* eslint-disable */
// src/app/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, MapPin, Users, Heart, Languages, History,
  Image as ImageIcon, Menu, X, Lock, Megaphone, Sparkles, Home as HomeIcon, User, Bell,
  Phone, Play, QrCode, HeartHandshake, Volume2, VolumeX, MessageCircle, Music, Drama, ChevronDown, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth, UserButton, useClerk } from "@clerk/nextjs";
import { getStats, getAnnouncements, getGalleryImages, checkAdminStatus, recordPageView, submitFeedback, getUserFeedbackStatus, getLiveStreamSettings, getActiveFestivalYear } from "@/lib/actions";
import FallingPetals from "./components/FallingPetals";


interface SiteStats {
  activeAnnouncements: number;
  villages: number;
}

const content = {
  en: {
    nav: { home: "Home", schedule: "Schedule", harikatha: "Harikatha", dramas: "Night Dramas", donors: "Donors", villages: "Villages", gallery: "Gallery", admin: "Admin Login", live: "Live" },
    village: "Chenchugudi",
    title1: "65th Annual Mahabharatham",
    title2: "Mahotsavam",
    badge: "Since 1961 · Our Sacred Tradition",
    desc: "Sri Krishna, Draupathi Sametha Dharmarajuvari Devasthanam — A grand 10-day celebration uniting 24 villages of Chenchugudi, Vedurukuppam Mandal in devotion, culture, and faith.",
    liveStats: { visitors: "Live Visitors", villages: "Villages" },
    annualSchedule: "Festival Schedule 2026",
    majorFest: "Main Festival",
    june: "Every June",
    days10: "10-Day Grand Mahotsavam",
    secondFest: "Second Festival",
    sept: "Every September",
    days7: "7-Day Utsavam",
    united: "United by Faith",
    unitedDesc: "With the blessings of the divine, all 24 surrounding villages of Chenchugudi, Vedurukuppam Mandal come together year after year to make this festival a monumental success.",
    chechugudi: "Chenchugudi",
    vill: "Village",
    announcements: "Announcements & News",
    liveStream: "Live Stream",
    historyTitle: "Our Sacred History",
    history1961Title: "Inception in 1961",
    history1961Desc: "The Dharmarajuvari Devasthanam was established, marking the beginning of the annual Mahabharatham Mahotsavam.",
    history24VillagesTitle: "Unity of 24 Villages",
    history24VillagesDesc: "The festival grew to unite 24 surrounding villages of Chenchugudi, Vedurukuppam Mandal, participating together in devotion and cultural harmony.",
    historyTodayTitle: "A 65-Year Legacy",
    historyTodayDesc: "Today, we celebrate the 65th continuous year of this grand 10-day tradition, preserving our heritage for future generations."
  },
  te: {
    nav: { home: "హోమ్", schedule: "పట్టిక", harikatha: "హరికథ", dramas: "నాటకాలు", donors: "దాతలు", villages: "గ్రామాలు", gallery: "గ్యాలరీ", admin: "అడ్మిన్ లాగిన్", live: "లైవ్" },
    village: "చెంచుగుడి",
    title1: "65వ సం॥ మహాభారత",
    title2: "మహోత్సవం",
    badge: "1961 నుండి ఘనంగా జరుగుతున్న ఉత్సవం",
    desc: "శ్రీ కృష్ణ, ద్రౌపతి సమేత ధర్మరాజులవారి దేవస్థానం — చెంచుగుడి, వెదురుకుప్పం మండలంలోని 24 గ్రామాలు ఏకమై భక్తి మరియు సంస్కృతితో జరుపుకునే 10-రోజుల ఘన మహోత్సవం.",
    liveStats: { visitors: "లైవ్ వీక్షకులు", villages: "గ్రామాలు" },
    annualSchedule: "ఉత్సవ కార్యక్రమాలు 2026",
    majorFest: "ప్రధాన ఉత్సవం",
    june: "ప్రతి జూన్ నెలలో",
    days10: "10-రోజుల ఘన మహోత్సవం",
    secondFest: "రెండవ ఉత్సవం",
    sept: "ప్రతి సెప్టెంబర్ నెలలో",
    days7: "7-రోజుల ఉత్సవం",
    united: "భక్తితో ఏకమయ్యాం",
    unitedDesc: "భగవంతుని ఆశీస్సులతో, చెంచుగుడి, వెదురుకుప్పం మండలంలోని మొత్తం 24 గ్రామాలు ఏటా ఈ ఉత్సవాన్ని ఘనంగా విజయవంతం చేయడానికి ఏకమవుతాయి.",
    chechugudi: "చెంచుగుడి",
    vill: "గ్రామం",
    announcements: "ప్రకటనలు & వార్తలు",
    liveStream: "లైవ్ స్ట్రీమ్",
    historyTitle: "మన గుడి - మన ఘన చరిత్ర",
    history1961Title: "1961 లో ప్రారంభం",
    history1961Desc: "ధర్మరాజులవారి దేవస్థానం స్థాపించబడి, వార్షిక మహాభారత మహోత్సవానికి శ్రీకారం చుట్టబడింది.",
    history24VillagesTitle: "24 గ్రామాల ఐక్యత",
    history24VillagesDesc: "చెంచుగుడి, వెదురుకుప్పం మండలంలోని 24 గ్రామాలు ఏకమై, భక్తి మరియు సాంస్కృతిక సామరస్యంతో ఈ ఉత్సవాన్ని ఒక మహాకార్యంగా తీర్చిదిద్దాయి.",
    historyTodayTitle: "65-సంవత్సరాల వారసత్వం",
    historyTodayDesc: "నేడు, మనం ఈ 10-రోజుల ఘనమైన సంప్రదాయం యొక్క 65వ సంవత్సరాన్ని జరుపుకుంటున్నాం, భావితరాలకు మన సంస్కృతిని అందిస్తున్నాం."
  }
};

// Village options are temporarily disabled with the donation form

const vijayadashamiDonors = [
  { n: '1', nameEn: "Sri M. Gangi Reddy's son Hari Krishna Reddy", nameTe: 'శ్రీ యం. గంగిరెడ్డి కుమారుడు హరికృష్ణారెడ్డి', locEn: 'Chintalagunta', locTe: 'చింతలగుంట' },
  { n: '2', nameEn: 'Sri M. Narasimha Reddy & Brothers', nameTe: 'శ్రీ యం. నరసింహారెడ్డి & బ్రదర్స్', locEn: 'Balupalli', locTe: 'బాలుపల్లి' },
  { n: '3', nameEn: 'Sri Y. Pratap Reddy and Sri Allakula Bhaskar, Revenue', nameTe: 'శ్రీ వై. ప్రతాప్ రెడ్డి మరియు శ్రీ అల్లాకుల భాస్కర్, రెవిన్యూ', locEn: 'Chenchugudi', locTe: 'చెంచుగుడి' },
  { n: '4', nameEn: "Sri B. Chinnaswamy Reddy's sons Nagaraja Reddy, Bhaskar Reddy", nameTe: 'శ్రీ బి. చిన్నస్వామిరెడ్డి కుమారులు నాగరాజరెడ్డి, భాస్కర్ రెడ్డి', locEn: 'Rentalacheenu', locTe: 'రెంటాలచేను' },
  { n: '5', nameEn: "Sri Jayaramaiah's sons Murali, Dr. Siri", nameTe: 'శ్రీ జయరామయ్య కుమారులు మురళి, డా॥ సిరి', locEn: 'Allamavarikadiga', locTe: 'అల్లంవారికండిగ' },
  { n: '6', nameEn: "Sri P. Venkata Reddy & Munemma's sons", nameTe: 'శ్రీ పి. వెంకటరెడ్డి & మునెమ్మ కుమారులు', locEn: 'Vavilacheenu', locTe: 'వావిలిచేను' },
  { n: '7', nameEn: 'Sri P. Gopal Reddy', nameTe: 'శ్రీ పి. గోపాల్ రెడ్డి', locEn: 'Chenchugudi', locTe: 'చెంచుగుడి' },
  { n: '8', nameEn: "Sri Madavali Krishnaiah's sons", nameTe: 'శ్రీ మడవలి కృష్ణయ్య కుమారులు', locEn: 'Chenchugudi', locTe: 'చెంచుగుడి' },
  { n: '9', nameEn: 'Sri M. Mani Prasad', nameTe: 'శ్రీ యం. మణి ప్రసాద్', locEn: 'Veperi', locTe: 'వేపేరి' },
  { n: '10', nameEn: 'Poola Rekha W/o. Sri Reddy Nagendra', nameTe: 'పూల రేఖ W/o. శ్రీ రెడ్డి నాగేంద్ర', locEn: 'Rentalacheenu', locTe: 'రెంటాలచేను' },
];



const pournamiDonors = [
  { monthEn: 'January', monthTe: 'జనవరి', nameEn: 'Sri Shamballi Vijayachandra Reddy, S. Raja Reddy', nameTe: 'శ్రీ శాంబల్లి విజయచంద్రా రెడ్డి, యస్. రాజారెడ్డి', locEn: 'Venugopalapuram', locTe: 'వేణుగోపాలపురం' },
  { monthEn: 'February', monthTe: 'ఫిబ్రవరి', nameEn: 'Sri Yerrasani Harinadha Reddy', nameTe: 'శ్రీ యర్రసాని హరినాధ రెడ్డి', locEn: 'Chenchugudi', locTe: 'చెంచుగుడి' },
  { monthEn: 'March', monthTe: 'మార్చి', nameEn: 'Sri Sripuram Nagabhushana Reddy', nameTe: 'శ్రీ శ్రీపురం నాగభూషణ రెడ్డి', locEn: 'Chenchugudi', locTe: 'చెంచుగుడి' },
  { monthEn: 'April', monthTe: 'ఏప్రిల్', nameEn: 'Sri Paidi Chengalraya Naidu', nameTe: 'శ్రీ పైడి చెంగల్రాయ నాయుడు', locEn: 'Reddepalli', locTe: 'రెడ్డేపల్లి' },
  { monthEn: 'May', monthTe: 'మే', nameEn: 'Sri Sripuram Madhava Reddy', nameTe: 'శ్రీ శ్రీపురం మాధవ రెడ్డి', locEn: 'Chenchugudi', locTe: 'చెంచుగుడి' },
  { monthEn: 'June', monthTe: 'జూన్', nameEn: 'Sri Madavali Damu, Lineman', nameTe: 'శ్రీ మడవలి దాము, లైన్‌మెన్', locEn: 'Chenchugudi', locTe: 'చెంచుగుడి' },
  { monthEn: 'July', monthTe: 'జూలై', nameEn: 'Sri M. Lokanadham Achari', nameTe: 'శ్రీ యం. లోకనాథం ఆచారి', locEn: 'Chenchugudi', locTe: 'చెంచుగుడి' },
  { monthEn: 'August', monthTe: 'ఆగష్టు', nameEn: "Sri B. Chengalraya Reddy's son Dilly Reddy, Sri G. Narayana Reddy's son Damodara Reddy", nameTe: 'శ్రీ బి. చెంగల్రాయ రెడ్డి కుమారుడు డిల్లీ రెడ్డి, శ్రీ జి. నారాయణ రెడ్డి కుమారుడు దామోదర రెడ్డి', locEn: 'Tirumalayya Palli', locTe: 'తిరుమలయ్యపల్లి' },
  { monthEn: 'September', monthTe: 'సెప్టెంబర్', nameEn: 'Sri Bandi Shivarama Reddy', nameTe: 'శ్రీ బండి శివరామరెడ్డి', locEn: 'Rentalacheenu', locTe: 'రెంటాలచేను' },
  { monthEn: 'October', monthTe: 'అక్టోబర్', nameEn: 'Sri Sareddu Narasimha Reddy', nameTe: 'శ్రీ సారెడ్డి నరసింహారెడ్డి', locEn: 'Chavanapalli', locTe: 'చవనపల్లి' },
  { monthEn: 'November', monthTe: 'నవంబర్', nameEn: "Sri Bandi Bhaskar Reddy's sons Prabhakar Reddy, Koteswar Reddy", nameTe: 'శ్రీ బండి భాస్కర్‌రెడ్డి కుమారులు ప్రభాకర్‌రెడ్డి, కోటేశ్వర్ రెడ్డి', locEn: 'Rentalacheenu', locTe: 'రెంటాలచేను' },
  { monthEn: 'December', monthTe: 'డిసెంబర్', nameEn: 'Sri Kanchi Devadri & Sons', nameTe: 'శ్రీ కంచి దేవాద్రి & సన్స్', locEn: 'Veperi', locTe: 'వేపేరి' },
];

const yagnamDonors = [
  { dateEn: '06-06-2026', dateTe: '06-6-2026', dayEn: 'Friday', dayTe: 'శుక్రవారం', nameEn: 'Sri Bandi Vijayasekhar Reddy', nameTe: 'శ్రీ బండి విజయశేఖర్ రెడ్డి', locEn: 'Rentalacheenu', locTe: 'రెంటాలచేను' },
  { dateEn: '07-06-2026', dateTe: '07-6-2026', dayEn: 'Saturday', dayTe: 'శనివారం', nameEn: 'Sri Poola Pattabhi Ramireddy, Trustee', nameTe: 'శ్రీ పూల పట్టాభి రామిరెడ్డి, ధర్మకర్త', locEn: 'Rentalacheenu', locTe: 'రెంటాలచేను' },
  { dateEn: '08-06-2026', dateTe: '08-6-2026', dayEn: 'Sunday', dayTe: 'ఆదివారం', nameEn: 'Sri K. Ananda Reddy, Chenchugudi, Sri Jayarama Reddy', nameTe: 'శ్రీ కె. ఆనందరెడ్డి, చెంచుగుడి, శ్రీ జయరామరెడ్డి', locEn: 'Chavanapalli', locTe: 'చవనపల్లి' },
  { dateEn: '09-06-2026', dateTe: '09-6-2026', dayEn: 'Monday', dayTe: 'సోమవారం', nameEn: 'Sri D. Nadhamuni Reddy, B.P.M.', nameTe: 'శ్రీ డి. నాధమునిరెడ్డి, బి.пи.ఎం.', locEn: 'Tirumalayya Palli', locTe: 'తిరుమలయ్యపల్లి' },
  { dateEn: '10-06-2026', dateTe: '10-6-2026', dayEn: 'Tuesday', dayTe: 'మంగళవారం', nameEn: 'Sri T. Devarajulu Reddy', nameTe: 'శ్రీ టి. దేవరాజులురెడ్డి', locEn: 'Boppalamadugu', locTe: 'బొప్పలమడుగు' },
  { dateEn: '11-06-2026', dateTe: '11-6-2026', dayEn: 'Wednesday', dayTe: 'బుధవారం', nameEn: 'Sri Bandi Love Reddy', nameTe: 'శ్రీ బండి లవ్‌రెడ్డి', locEn: 'Chenchugudi', locTe: 'చెంచుగుడి' },
  { dateEn: '12-06-2026', dateTe: '12-6-2026', dayEn: 'Thursday', dayTe: 'గురువారం', nameEn: 'Sri M. Shanmugam Achari', nameTe: 'శ్రీ యం షణ్ముగం ఆచారి', locEn: 'Chenchugudi', locTe: 'చెంచుగుడి' },
  { dateEn: '13-06-2026', dateTe: '13-6-2026', dayEn: 'Friday', dayTe: 'శుక్రవారం', nameEn: 'Sri Yerrasani Krishna Reddy', nameTe: 'శ్రీ యర్రసాని కృష్ణారెడ్డి', locEn: 'Chenchugudi', locTe: 'చెంచుగుడి' },
  { dateEn: '14-06-2026', dateTe: '14-6-2026', dayEn: 'Saturday', dayTe: 'శనివారం', nameEn: "Late Sri Keshavulu Reddy's son Sri S. Mohan Babu", nameTe: 'కీ॥శే॥ శ్రీ కేశవులురెడ్డి కుమారుడు శ్రీ యస్. మోహన్‌బాబు', locEn: 'Chenchugudi', locTe: 'చెంచుగుడి' },
];

const annadanamDonors = [
  {
    date: '29-5-2026',
    dayEn: 'Friday (First Day)',
    dayTe: 'శుక్రవారం (తొలి రోజు)',
    timeEn: 'at 8:00 PM',
    timeTe: 'రాత్రి 8.00 గం||లకు',
    descEn: 'Organized under the leadership of P. Venkatesh, Ration Shop Dealer (son of P. Munaswamy) and P. Mallikarjuna Yadav, Goduguchintha.',
    descTe: 'పి. మునస్వామి కుమారుడు పి. వెంకటేష్, రేషన్ షాపు డీలర్ మరియు పి. మల్లికార్జున యాదవ్, గొడుగుచింత వారి ఆధ్వర్యంలో జరుపబడును.'
  },
  {
    date: '30-5-2026',
    dayEn: 'Saturday',
    dayTe: 'శనివారం',
    timeEn: 'at 7:00 PM',
    timeTe: 'రాత్రి 7.00 గం||లకు',
    descEn: "Siripireddy Narasimha Reddy's sons S. Chokkalinga Reddy, S. Subrahmanyam Reddy, Balupalli.",
    descTe: 'శిరిపిరెడ్డి నరసింహా రెడ్డి కుమారులు యస్. చొక్కలింగా రెడ్డి, యస్. సుబ్రహ్మణ్యం రెడ్డి, బాలుపల్లి'
  },
  {
    date: '1-6-2026',
    dayEn: 'Monday (Goddess Wedding Day)',
    dayTe: 'సోమవారం అమ్మవారి కళ్యాణం రోజు',
    timeEn: 'at 7:00 PM',
    timeTe: 'రాత్రి 7.00 గం||లకు',
    descEn: 'In memory of Late Kola Babayya, organized by his wife Rangamma and sons Jagadish (Retired Teacher), Lakshmayya, Kumaraswamy, Ramachandrayya, Venugopalapuram.',
    descTe: 'లేట్ కోలా బాబయ్య జ్ఞాపకార్థం భార్య రంగమ్మ మరియు కుమారులు జగదీష్, రిటైర్డు టీచర్, లక్ష్మయ్య, కుమారస్వామి, రామచంద్రయ్య, వేణుగోపాలపురం వారి ఆధ్వర్యంలో జరుపబడును.'
  },
  {
    date: '2-6-2026',
    dayEn: 'Tuesday (Vastrapaharanam Day)',
    dayTe: 'మంగళవారం వస్త్రాపహరణం రోజు',
    timeEn: 'at 7:00 PM',
    timeTe: 'రాత్రి 7.00 గం||లకు',
    descEn: 'Organized by N. Subrahmanyam, Jayamma, Kutrapakam Murali, Nirmala and N. Narasimhulu, Sarojamma, residents of Goduguchintha.',
    descTe: 'యన్. సుబ్రహ్మణ్యం, జయమ్మ, కుట్రపాకం మురళి, నిర్మల మరియు యన్. నరసింహులు, సరోజమ్మ గొడుగుచింత వాస్తవ్యులు వారి ఆధ్వర్యంలో జరుపబడును.'
  },
  {
    date: '3-6-2026',
    dayEn: 'Wednesday (Penance Day)',
    dayTe: 'బుధవారం తపస్సు కార్యక్రమము రోజు',
    timeEn: 'at 7:00 PM',
    timeTe: 'రాత్రి 7.00 గం||లకు',
    descEn: 'Organized under the leadership of Bandi Bharath Reddy, son of Late Bandi Rajasekhar Reddy, Rentalachenu.',
    descTe: 'కీ||శే|| బండి రాజశేఖర్ రెడ్డి కుమారుడు బండి భరత్ రెడ్డి, రెంటాలచేను వారి ఆధ్వర్యంలో జరుపబడును.'
  },
  {
    date: '4-6-2026',
    dayEn: 'Thursday (Keechaka Vadham Day)',
    dayTe: 'గురువారం కీచకవధ రోజు',
    timeEn: 'at 7:00 PM',
    timeTe: 'రాత్రి 7.00 గం||లకు',
    descEn: 'Organized under the leadership of Pandikunta Munireddy, Ex. M.P.T.C., Chenchugudi.',
    descTe: 'పందికుంట మునిరెడ్డి, మాజీ యం.పి.టి.సి., చెంచుగుడి వారి ఆధ్వర్యంలో జరుపబడును.'
  },
  {
    date: '5-6-2026',
    dayEn: 'Friday',
    dayTe: 'శుక్రవారం',
    timeEn: 'at 7:00 PM',
    timeTe: 'రాత్రి 7.00 గం||లకు',
    descEn: "Organized under the leadership of Late Nagaraja Achari's sons Vinod, Kishore.",
    descTe: 'కీ||శే|| నాగరాజ ఆచారి కుమారులు వినోద్, కిషోర్ వారి ఆధ్వర్యంలో జరుపబడును.'
  },
  {
    date: '6-6-2026',
    dayEn: 'Saturday',
    dayTe: 'శనివారం',
    timeEn: 'at 7:00 PM',
    timeTe: 'రాత్రి 7.00 గం||లకు',
    descEn: "Organized under the leadership of Nagireddy Subrahmanyam Reddy, Parvathamma's grandson Naga Simha Reddy, Chenchugudi.",
    descTe: 'నాగిరెడ్డి సుబ్రహ్మణ్యం రెడ్డి, పార్వతమ్మ మనవడు నాగ సింహా రెడ్డి, చెంచుగుడి వారి ఆధ్వర్యంలో జరుపబడును.'
  },
  {
    date: '7-6-2026',
    dayEn: 'Sunday (Fire Walk Day)',
    dayTe: 'ఆదివారం అగ్నిగుండ ప్రవేశం రోజు',
    timeEn: 'at 7:00 PM',
    timeTe: 'రాత్రి 7.00 గం||లకు',
    descEn: 'Organized under the leadership of Sri Vidya Vaidyasala, Chavatagunta Mrs. N. Munemma & N. Babu (Sarpanch, Goduguchintha), son Mrs. N. Sandhya & Dr. Sri N. Madhu, M.Sc. (PSY).',
    descTe: 'శ్రీ విద్య వైద్యశాల, చవటగుంట శ్రీమతి యన్. మునెమ్మ & యన్. బాబు, సర్పంచ్ గొడుగుచింత కుమారుడు శ్రీమతి యన్. సంధ్య & డా|| శ్రీ యన్. మధు, M.Sc. (PSY) వారి ఆధ్వర్యంలో జరుపబడును.'
  }
];

export default function Home() {
  const [lang, setLang] = useState<"en" | "te">("te");
  const [isScrolled, setIsScrolled] = useState(false);
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [activeYearData, setActiveYearData] = useState<any>(null);
  const [liveStreamSettings, setLiveStreamSettings] = useState<{ url: string; platform: string; isActive: boolean } | null>(null);
  const [activeDonorTab, setActiveDonorTab] = useState<"vijayadashami" | "pournami" | "yagnam" | "annadanam">("annadanam");
  const [activeProgramTab, setActiveProgramTab] = useState<"harikatha" | "dramas">("harikatha");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = content[lang];
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Feedback states
  const [showFeedbackWidget, setShowFeedbackWidget] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);

  // History expand state
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  // Live Stream expand state
  const [isLiveStreamExpanded, setIsLiveStreamExpanded] = useState(false);

  // Push Notification state
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  // Gallery states (simplified for homepage)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxItems, setLightboxItems] = useState<any[]>([]);

  // Initialize Push Notifications
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true);
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsPushSubscribed(!!subscription);
          if (!subscription && Notification.permission === 'default') {
            // Check if user already interacted with the prompt before
            const hasInteracted = localStorage.getItem('pushPromptInteracted');
            if (!hasInteracted) {
              // Show prompt after 10 seconds of visiting
              setTimeout(() => setShowPushPrompt(true), 10000);
            }
          }
        });
      });
    }
  }, []);

  const handleDismissPushPrompt = () => {
    localStorage.setItem('pushPromptInteracted', 'true');
    setShowPushPrompt(false);
  };

  const subscribeToPushNotifications = async () => {
    // Hide the HTML popup immediately so it doesn't stay stuck
    handleDismissPushPrompt();

    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) return;

      const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      setIsPushSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Background Tab Flashing for Live Stream
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const originalTitle = "Chenchugudi Mahabharatham";

    const handleVisibilityChange = () => {
      if (document.hidden && liveStreamSettings?.isActive) {
        let isFlash = false;
        interval = setInterval(() => {
          document.title = isFlash ? "🔴 LIVE NOW!" : "▶️ Watch Live";
          isFlash = !isFlash;
        }, 1000);
      } else {
        clearInterval(interval);
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Check immediately in case live stream starts while tab is already hidden
    handleVisibilityChange();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, [liveStreamSettings?.isActive]);

  // Record page view on load (DAU analytics)
  useEffect(() => {
    recordPageView();
    
    // Check if user has already voted
    const voted = localStorage.getItem("votedWebsite");
    if (voted) {
      setHasVoted(true);
    } else {
      // Show feedback widget after 60 seconds on the page
      const timer = setTimeout(() => {
        setShowFeedbackWidget(true);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleVoteSubmit = async (isLike: boolean) => {
    setSubmittingVote(true);
    try {
      const res = await submitFeedback(isLike);
      if (res.success) {
        localStorage.setItem("votedWebsite", "true");
        setFeedbackSuccess(true);
        // Beautiful success delay before auto-hiding the card
        setTimeout(() => {
          setShowFeedbackWidget(false);
          setHasVoted(true);
        }, 3000);
      }
    } catch (e) {
      console.error("Failed to submit feedback:", e);
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, onClick?: () => void) => {
    if (onClick) onClick();
    setIsMobileMenuOpen(false);
    
    // If it's a real page route (like /gallery), let standard navigation happen
    if (href.startsWith('/')) {
      return; 
    }

    e.preventDefault();
    
    if (href === '#live') {
      setIsLiveStreamExpanded(true);
    }
    
    const targetId = href;
    const element = document.querySelector(targetId);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };


  // Helper to format a Date nicely in English or Telugu
  const formatDate = useCallback((dateInput: string | Date, language: "en" | "te") => {
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return String(dateInput);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };

      return d.toLocaleDateString(language === 'en' ? 'en-US' : 'te-IN', options);
    } catch (e) {
      return String(dateInput);
    }
  }, []);



  const openLightbox = (items: any[], startIndex: number) => {
    setLightboxItems(items);
    setLightboxIndex(startIndex);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setLightboxItems([]);
    document.body.style.overflow = 'auto';
  };

  // Check admin status and sign out unauthorized users
  useEffect(() => {
    let active = true;
    const verifyAdmin = async () => {
      if (isSignedIn) {
        try {
          const { isAdmin: isWhitelisted } = await checkAdminStatus();
          if (active) {
            setIsAdmin(isWhitelisted);
            if (!isWhitelisted) {
              console.warn("Signed in user is not an admin. Logging out automatically.");
              await signOut();
              setIsAdmin(false);
            }
          }
        } catch (err) {
          console.error("Error verifying admin status:", err);
        }
      } else {
        setIsAdmin(false);
      }
    };

    verifyAdmin();

    return () => {
      active = false;
    };
  }, [isSignedIn, signOut]);

  // Fetch all backend data
  const loadData = useCallback(async () => {
    try {
      const [statsData, announceList, galleryList, liveData, activeYear] = await Promise.all([
        getStats(),
        getAnnouncements(),
        getGalleryImages(10),
        getLiveStreamSettings(),
        getActiveFestivalYear()
      ]);

      setSiteStats(statsData);
      setAnnouncements(announceList);
      setGalleryImages(galleryList);
      setActiveYearData(activeYear);
      if (liveData.success) {
        setLiveStreamSettings({ 
          url: liveData.liveStreamUrl, 
          platform: liveData.liveStreamPlatform || 'youtube',
          isActive: liveData.isLiveActive 
        });
      }
    } catch (e) {
      console.error("Failed to load backend data:", e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle scroll for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Donation submission handler temporarily removed

  return (
    <div className="min-h-screen bg-[#fffdf5] mandala-bg selection:bg-[#E25822] selection:text-white pb-24 text-gray-800">
      <FallingPetals />

      {/* GLOBAL LIVE BANNER */}
      <AnimatePresence>
        {liveStreamSettings?.isActive && liveStreamSettings.url && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "40px", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-red-600 text-white z-[101] flex items-center justify-center cursor-pointer overflow-hidden group shadow-md"
            onClick={() => {
              setIsLiveStreamExpanded(true);
              const liveSection = document.getElementById('live');
              if (liveSection) {
                const navOffset = 90;
                const elementPosition = liveSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navOffset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-[length:200%_auto] animate-shimmer opacity-50"></div>
            <div className="relative z-10 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span className="font-bold tracking-widest text-[10px] md:text-xs uppercase group-hover:scale-105 transition-transform flex items-center gap-1">
                {lang === 'en' ? 'LIVE NOW: Click here to watch' : 'ప్రత్యక్ష ప్రసారం: ఇప్పుడే చూడండి'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Floating WhatsApp Community Button */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[90]">
        <a
          href="https://api.whatsapp.com/send?text=శ్రీ మహాభారత మహోత్సవ తేదీలు మరియు వివరాలు తెలుసుకోండి! 🙏%0A%0ACheck out the 65th Annual Chenchugudi Mahabharatham Festival schedule and live updates!%0A%0Ahttps://chenchugudi-mahabharatham.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#128C7E] text-white p-3.5 md:p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_40px_rgba(37,211,102,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center group relative cursor-pointer"
        >
          <span className="absolute inset-0 rounded-full border border-[#25D366] animate-ping opacity-50 pointer-events-none"></span>
          <MessageCircle size={28} className="fill-white" />
          <span className="absolute right-[120%] bottom-1/2 translate-y-1/2 bg-white text-[#128C7E] font-bold text-xs md:text-sm px-4 py-2 rounded-2xl rounded-br-none opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl border border-green-100 pointer-events-none origin-bottom-right scale-95 group-hover:scale-100">
            {lang === 'en' ? 'Share with Friends & Family' : 'వాట్సాప్‌లో పంచుకోండి'}
          </span>
        </a>
      </div>

      {/* Push Notification Opt-in Prompt */}
      <AnimatePresence>
        {showPushPrompt && !isPushSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-4 md:bottom-28 md:right-8 z-[100] w-[90%] md:w-96 bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#580000] to-[#8B0000] p-4 text-white flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xl">🔔</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm">{lang === 'en' ? 'Get Live Notifications' : 'లైవ్ నోటిఫికేషన్లు పొందండి'}</h4>
                  <p className="text-xs text-orange-200 mt-0.5">{lang === 'en' ? 'We will notify you when the festival is Live!' : 'ఉత్సవం ప్రారంభమైనప్పుడు మేము మీకు తెలియజేస్తాము!'}</p>
                </div>
              </div>
              <button onClick={handleDismissPushPrompt} className="text-white/60 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex gap-3 bg-[#fffdf5]">
              <button onClick={handleDismissPushPrompt} className="flex-1 py-2 rounded-xl text-gray-500 font-bold text-sm hover:bg-gray-100 transition-colors">
                {lang === 'en' ? 'Not Now' : 'ఇప్పుడు వద్దు'}
              </button>
              <button onClick={subscribeToPushNotifications} className="flex-1 py-2 bg-gradient-to-r from-[#FFD700] to-orange-500 text-[#580000] rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all">
                {lang === 'en' ? 'Allow' : 'అనుమతించు'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sidebar Navigation */}
      <div className="hidden md:flex fixed right-4 bottom-24 z-[90] flex-col gap-1.5 bg-[#580000]/90 backdrop-blur-md p-1.5 rounded-full border border-[#FFD700]/30 shadow-2xl">
        {[
          { id: 'home', icon: <HomeIcon size={16} className="md:w-[18px] md:h-[18px]" />, label: t.nav.home, href: '#home' },
          { id: 'announcements', icon: <Megaphone size={16} className="md:w-[18px] md:h-[18px]" />, label: lang === 'en' ? 'News' : 'వార్తలు', href: '#announcements' },
          { id: 'schedule', icon: <CalendarDays size={16} className="md:w-[18px] md:h-[18px]" />, label: t.nav.schedule, href: '#schedule' },
          { id: 'harikatha', icon: <Music size={16} className="md:w-[18px] md:h-[18px]" />, label: t.nav.harikatha, href: '#programs', onClick: () => setActiveProgramTab("harikatha") },
          { id: 'dramas', icon: <Drama size={16} className="md:w-[18px] md:h-[18px]" />, label: t.nav.dramas, href: '#programs', onClick: () => setActiveProgramTab("dramas") },
          { id: 'donors', icon: <HeartHandshake size={16} className="md:w-[18px] md:h-[18px]" />, label: t.nav.donors, href: '#donors' },
          { id: 'villages', icon: <Users size={16} className="md:w-[18px] md:h-[18px]" />, label: lang === 'en' ? 'Villages' : 'గ్రామాలు', href: '#villages' },
          { id: 'gallery', icon: <ImageIcon size={16} className="md:w-[18px] md:h-[18px]" />, label: t.nav.gallery, href: '/gallery' },
        ].map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={(e) => handleNavClick(e, item.href, item.onClick)}
            title={item.label}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-[#FFD700] hover:text-[#580000] hover:scale-110 transition-all duration-300"
          >
            {item.icon}
          </Link>
        ))}
      </div>

      {/* Sticky Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-[100] transition-all duration-500 ${(isScrolled || isMobileMenuOpen) ? 'bg-[#580000]/85 backdrop-blur-2xl shadow-2xl py-3 border-b border-[#FFD700]/20' : 'bg-transparent py-5'} ${(liveStreamSettings?.isActive && liveStreamSettings.url) ? 'top-[40px]' : 'top-0'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3 text-white">
            <span className="text-3xl om-shadow animate-pulse-glow">ॐ</span>
            <div className="hidden sm:block">
              <p className={`font-display font-bold text-base text-[#FFD700] leading-none ${lang === 'en' ? 'tracking-widest' : 'tracking-normal'}`}>
                {lang === 'en' ? 'CHENCHUGUDI' : 'చెంచుగుడి'}
              </p>
              <p className={`text-[10px] text-orange-200/70 ${lang === 'en' ? 'tracking-[0.3em] uppercase' : 'tracking-normal mt-1'}`}>
                {lang === 'en' ? 'Mahabharatham' : 'మహాభారతం'}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {[
              { href: '#home', label: t.nav.home },
              ...(liveStreamSettings?.isActive ? [{ href: '#live', label: t.nav.live }] : []),
              { href: '#announcements', label: lang === 'en' ? 'News' : 'వార్తలు' },
              { href: '#schedule', label: t.nav.schedule },
              {
                label: lang === 'en' ? 'Programs' : 'కార్యక్రమాలు',
                dropdown: [
                  { href: '#programs', label: t.nav.harikatha, onClick: () => setActiveProgramTab("harikatha") },
                  { href: '#programs', label: t.nav.dramas, onClick: () => setActiveProgramTab("dramas") },
                ]
              },
              {
                label: lang === 'en' ? 'More' : 'మరిన్ని',
                dropdown: [
                  { href: '#donors', label: t.nav.donors },
                  { href: '#villages', label: t.nav.villages },
                  { href: '/gallery', label: t.nav.gallery },
                ]
              }
            ].map((link, idx) => link.dropdown ? (
              <div key={idx} className="relative group">
                <button className="px-3 py-2 rounded-full text-white/80 hover:text-[#FFD700] hover:bg-white/8 font-semibold text-[11px] xl:text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1">
                  {link.label} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#3D0000]/95 backdrop-blur-xl border border-[#FFD700]/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden flex flex-col py-2">
                  {link.dropdown.map(sublink => (
                    <a
                      key={sublink.label}
                      href={sublink.href}
                      onClick={(e) => handleNavClick(e, sublink.href, (sublink as any).onClick)}
                      className="px-4 py-2.5 text-white/80 hover:text-[#FFD700] hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      {sublink.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, (link as any).href, (link as any).onClick)}
                className="px-3 py-2 rounded-full text-white/80 hover:text-[#FFD700] hover:bg-white/8 font-semibold text-[11px] xl:text-xs uppercase tracking-wider transition-all duration-200"
              >
                {link.label === t.nav.live ? (
                  <span className="flex items-center gap-1.5 text-red-400 font-black animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>{link.label}
                  </span>
                ) : (
                  link.label
                )}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "te" : "en")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white hover:bg-[#FFD700]/20 hover:border-[#FFD700]/40 hover:text-[#FFD700] transition-all duration-200"
            >
              <Languages size={14} />
              <span className="text-xs font-bold tracking-wider">{lang === "en" ? "తెలుగు" : "ENG"}</span>
            </button>
            {/* Admin / User */}
            {isSignedIn && isAdmin ? (
              <div className="flex items-center gap-3 flex-row">
                <Link href="/admin" className="hidden md:flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/30 hover:bg-[#FFD700]/20 text-[#FFD700] px-4 py-2 rounded-full font-bold text-sm transition-all duration-200">
                  {lang === 'en' ? '⚙️ Dashboard' : '⚙️ డ్యాష్‌బోర్డ్'}
                </Link>
                <UserButton />
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#E25822] to-[#C1440E] hover:from-[#FF6B35] hover:to-[#E25822] text-white px-5 py-2 rounded-full font-bold text-sm transition-all duration-200 shadow-lg shadow-orange-800/30">
                <Lock size={14} /> {t.nav.admin}
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white hover:text-[#FFD700] transition-colors focus:outline-none p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

      </motion.nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-[#3D0000]/98 backdrop-blur-xl pt-[76px] px-6 pb-8 z-[99] lg:hidden overflow-y-auto shadow-2xl flex flex-col gap-6"
          >
            {[
              { href: '#home', label: t.nav.home },
              ...(liveStreamSettings?.isActive ? [{ href: '#live', label: t.nav.live }] : []),
              { href: '#announcements', label: lang === 'en' ? 'News' : 'వార్తలు' },
              { href: '#schedule', label: t.nav.schedule },
              { href: '#programs', label: t.nav.harikatha, onClick: () => setActiveProgramTab("harikatha") },
              { href: '#programs', label: t.nav.dramas, onClick: () => setActiveProgramTab("dramas") },
              { href: '#donors', label: t.nav.donors },
              { href: '#villages', label: t.nav.villages },
              { href: '/gallery', label: t.nav.gallery },
            ].map(link => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e as any, (link as any).href, (link as any).onClick)}
                className="text-white/80 hover:text-[#FFD700] font-bold text-sm uppercase tracking-wider py-2.5 border-b border-white/5 last:border-0 transition-colors flex items-center gap-2"
              >
                {link.label === t.nav.live ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-ping"></span>
                    <span className="text-red-400">{link.label}</span>
                  </>
                ) : (
                  link.label
                )}
              </Link>
            ))}
            {/* Admin Button on Mobile */}
            {!isSignedIn && (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#E25822] to-[#C1440E] text-white py-3 rounded-full font-bold text-sm shadow-md mt-2"
              >
                <Lock size={14} /> {t.nav.admin}
              </Link>
            )}
            {isSignedIn && isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] py-3 rounded-full font-bold text-sm"
              >
                ⚙️ {lang === 'en' ? 'Dashboard' : 'డ్యాష్‌బోర్డ్'}
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ HERO SECTION ══════════════════════════════════ */}
      <section id="home" className={`relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden text-white pb-16 transition-all duration-500 ${(liveStreamSettings?.isActive && liveStreamSettings.url) ? 'pt-36 md:pt-40' : 'pt-24'}`}
        style={{ background: 'linear-gradient(160deg, #1a0000 0%, #3D0000 30%, #580000 55%, #7A1500 80%, #3D0000 100%)' }}
      >
        {/* Radial glow layers */}
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(226,88,34,0.25) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse 50% 50% at 20% 80%, rgba(255,215,0,0.08) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse 50% 50% at 80% 20%, rgba(255,140,0,0.06) 0%, transparent 60%)' }} />

        {/* Decorative OM symbols in corners */}
        <div className="absolute top-24 left-8 text-6xl text-[#FFD700]/8 font-display select-none animate-float" style={{ animationDelay: '0s' }}>ॐ</div>
        <div className="absolute top-32 right-8 text-5xl text-[#FFD700]/6 font-display select-none animate-float" style={{ animationDelay: '1.5s' }}>ॐ</div>
        <div className="absolute bottom-20 left-12 text-4xl text-orange-400/8 font-display select-none animate-float" style={{ animationDelay: '3s' }}>✦</div>
        <div className="absolute bottom-24 right-12 text-4xl text-[#FFD700]/6 font-display select-none animate-float" style={{ animationDelay: '2s' }}>✦</div>

        {/* Subtle dot pattern */}
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,215,0,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center w-full">
          {/* Top badges */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-3 w-full max-w-2xl mx-auto"
          >
            <div className={`flex-1 flex justify-center items-center gap-2 w-full px-5 py-2 rounded-full border border-[#FFD700]/35 bg-[#FFD700]/8 backdrop-blur-sm text-[#FFD700] text-xs font-bold ${lang === 'en' ? 'tracking-[0.2em] uppercase' : 'tracking-normal'}`}>
              <MapPin size={13} className="shrink-0" /> <span className="text-center">{t.village} · {lang === 'en' ? 'Vedurukuppam Mandal' : 'వెదురుకుప్పం మండలం'}</span>
            </div>
            <div className={`flex-1 flex justify-center items-center gap-2 w-full px-5 py-2 rounded-full border border-orange-400/30 bg-orange-400/8 backdrop-blur-sm text-orange-200 text-xs font-bold ${lang === 'en' ? 'tracking-[0.2em] uppercase' : 'tracking-normal'}`}>
              <History size={13} className="shrink-0" /> <span className="text-center">{t.badge}</span>
            </div>
          </motion.div>

          {/* Deity Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, type: 'spring' }}
            className="mb-8 relative"
          >
            <div className="absolute -inset-4 bg-[#FFD700]/20 blur-2xl rounded-full animate-pulse-glow"></div>

            {/* Spinning Mandala Background */}
            <div className="absolute -inset-8 md:-inset-10 z-0 animate-spin-slow opacity-50 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#FFD700]/30 fill-none stroke-current" strokeWidth="0.5">
                {[...Array(12)].map((_, i) => (
                  <path
                    key={i}
                    d="M 50 50 C 42 30, 42 10, 50 2 C 58 10, 58 30, 50 50"
                    transform={`rotate(${i * 30} 50 50)`}
                  />
                ))}
                <circle cx="50" cy="50" r="41" strokeDasharray="1 3" />
                <circle cx="50" cy="50" r="44" strokeDasharray="2 2" />
              </svg>
            </div>

            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full p-1.5 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#E25822] shadow-[0_0_40px_rgba(255,215,0,0.4)] relative z-10">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#3D0000] bg-[#3D0000]">
                <img
                  src="/images/deity.jpg"
                  alt="Deity"
                  className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
            {/* Small Om floating near the image */}
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#FFD700] rounded-full border-4 border-[#3D0000] flex items-center justify-center shadow-lg z-20">
              <span className="text-[#3D0000] text-2xl font-black font-display leading-none pb-1">ॐ</span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-black mb-4 leading-tight"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
          >
            <span className="text-gold-gradient animate-shimmer inline-block" style={{ backgroundSize: '200% auto' }}>{t.title1}</span>
            <br />
            <span className="text-white/95">{t.title2}</span>
          </motion.h1>

          {/* Gold divider */}
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="w-48 md:w-64 divider-gold my-6"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base md:text-xl mb-10 text-orange-100/80 max-w-2xl leading-relaxed"
            style={{ fontFamily: 'var(--font-hind-guntur), sans-serif' }}
          >
            {t.desc}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <a href="#schedule"
              onClick={(e) => handleNavClick(e, '#schedule')}
              className="px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest text-[#580000] transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 4px 20px rgba(255,215,0,0.35)' }}
            >
              {lang === 'en' ? '📅 View Schedule' : '📅 కార్యక్రమాలు'}
            </a>
            <Link href="/gallery"
              className="px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest text-white border border-white/25 bg-white/8 backdrop-blur-sm hover:bg-white/15 hover:border-white/40 transition-all duration-300"
            >
              {lang === 'en' ? '🖼️ View Gallery' : '🖼️ గ్యాలరీ'}
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="w-full max-w-3xl grid grid-cols-3 glass-dark rounded-3xl overflow-hidden shadow-2xl border border-white/8"
          >
            {[
              { icon: <Users size={22} />, value: siteStats?.villages ?? 24, label: t.liveStats.villages },
              { icon: <CalendarDays size={22} />, value: 10, label: lang === 'en' ? 'Festival Days' : 'ఉత్సవ రోజులు' },
              { icon: <Megaphone size={22} />, value: siteStats?.activeAnnouncements ?? '—', label: lang === 'en' ? 'News' : 'ప్రకటనలు' },
            ].map((stat, i) => (
              <div key={i} className={`flex flex-col items-center justify-center py-6 px-4 ${i < 2 ? 'border-r border-white/8' : ''}`}>
                <div className="text-[#FFD700] mb-2">{stat.icon}</div>
                <p className="text-2xl md:text-4xl font-black text-white leading-none">{stat.value}</p>
                <p className="text-[9px] md:text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40"
        >
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-[#FFD700]/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>



      {/* ══ HISTORY TIMELINE SECTION ══════════════════════ */}
      <section id="history" className="py-12 md:py-16 px-6 relative bg-[#fffdf5] overflow-hidden">
        {/* Decorative Mandalas */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E25822]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-[#E25822] text-xs tracking-widest font-bold uppercase mb-4 shadow-sm">
              <History size={14} /> Since 1961
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black text-[#3D0000] drop-shadow-sm mb-6">{t.historyTitle}</h2>
            
            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="px-6 py-2.5 rounded-full border border-[#3D0000]/20 text-[#3D0000] font-bold text-sm uppercase tracking-wider hover:bg-[#3D0000]/5 hover:border-[#3D0000]/40 transition-all duration-300 mx-auto inline-flex items-center gap-2"
            >
              {isHistoryExpanded ? (lang === 'en' ? 'Show Less' : 'తక్కువ చూపించు') : (lang === 'en' ? 'Read Our History' : 'మా చరిత్ర చదవండి')}
            </button>
          </motion.div>

          {/* Timeline */}
          <AnimatePresence>
            {isHistoryExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative overflow-hidden"
              >
                {/* Center Line */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FFD700] via-[#E25822] to-transparent -translate-x-1/2"></div>
                
                <div className="pt-8">
                  {[
              {
                year: '1961',
                title: t.history1961Title,
                desc: t.history1961Desc,
                icon: <Users size={24} />,
                align: 'left'
              },
              {
                year: '24',
                title: t.history24VillagesTitle,
                desc: t.history24VillagesDesc,
                icon: <HeartHandshake size={24} />,
                align: 'right'
              },
              {
                year: '2026',
                title: t.historyTodayTitle,
                desc: t.historyTodayDesc,
                icon: <Sparkles size={24} />,
                align: 'left'
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                className={`relative flex flex-col md:flex-row items-center gap-8 mb-16 last:mb-0 ${item.align === 'right' ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Content Card */}
                <div className={`w-full md:w-1/2 flex ${item.align === 'right' ? 'md:justify-start' : 'md:justify-end'}`}>
                  <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-[#FFD700]/20 hover:shadow-[0_15px_50px_rgba(226,88,34,0.15)] hover:border-[#FFD700]/40 transition-all duration-300 w-full md:max-w-[90%] relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] to-[#E25822] rounded-t-3xl"></div>
                    <h3 className="text-2xl font-black font-display text-[#3D0000] mb-3 group-hover:text-[#E25822] transition-colors">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>

                {/* Center Node */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-16 h-16 bg-[#3D0000] rounded-full border-4 border-[#fffdf5] items-center justify-center text-[#FFD700] shadow-[0_0_20px_rgba(226,88,34,0.3)] z-10 group-hover:scale-110 transition-transform">
                  <span className="font-display font-black text-xl">{item.year}</span>
                </div>
              </motion.div>
            ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══ LIVE STREAM SECTION ════════════════════════════ */}
      {liveStreamSettings?.isActive && liveStreamSettings.url && (
        <section id="live" className="py-12 md:py-16 px-6 relative bg-[#fffdf5]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#3D0000] to-[#fffdf5] h-[300px] z-0"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            {/* Section Header */}
            <div className="flex flex-col items-center gap-3 mb-8 text-center">
              <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> Live Now
              </span>
              <h2 className="font-display text-2xl md:text-4xl font-black text-white drop-shadow-md">{t.liveStream}</h2>
              <button
                onClick={() => setIsLiveStreamExpanded(!isLiveStreamExpanded)}
                className="mt-2 px-6 py-2.5 rounded-full border border-white/20 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/10 hover:border-white/40 transition-all duration-300 mx-auto inline-flex items-center gap-2 shadow-lg"
              >
                {isLiveStreamExpanded ? (lang === 'en' ? 'Close Player' : 'ప్లేయర్ మూసివేయి') : (lang === 'en' ? 'Watch Live Now' : 'ఇప్పుడే లైవ్ చూడండి')}
              </button>
            </div>

            <AnimatePresence>
              {isLiveStreamExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="relative overflow-hidden"
                >
                  <div className="pt-2">
                    <div className="rounded-3xl p-1 md:p-2 bg-gradient-to-br from-[#FFD700] via-[#E25822] to-[#FFD700] shadow-[0_20px_50px_rgba(226,88,34,0.3)] animate-pulse-glow">
                      <div className="rounded-[22px] overflow-hidden bg-black aspect-video relative">
                        <iframe
                          className="w-full h-full absolute top-0 left-0"
                          src={(() => {
                            const url = liveStreamSettings.url;
                            const platform = liveStreamSettings.platform;
                            
                            if (platform === "youtube") {
                              let videoId = url;
                              if (url.includes("youtube.com/watch?v=")) {
                                videoId = url.split("v=")[1].split("&")[0];
                              } else if (url.includes("youtu.be/")) {
                                videoId = url.split("youtu.be/")[1].split("?")[0];
                              } else if (url.includes("youtube.com/embed/")) {
                                return url; // already embed
                              }
                              return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
                            } else if (platform === "facebook") {
                              return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
                            } else if (platform === "twitch") {
                              let channel = url;
                              if (url.includes("twitch.tv/")) {
                                channel = url.split("twitch.tv/")[1].split("?")[0];
                              }
                              return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&autoplay=true`;
                            } else if (platform === "instagram") {
                              if (url.includes("instagram.com/p/") || url.includes("instagram.com/reel/")) {
                                return `${url.split('?')[0]}embed/`;
                              }
                              return url;
                            }
                            
                            return url;
                          })()}
                          title="Chenchugudi Mahabharatham Live Stream"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* ══ ANNOUNCEMENTS SECTION ══════════════════════════ */}
      <section id="announcements" className="py-12 md:py-16 px-6" style={{ background: 'linear-gradient(180deg, #fffdf5 0%, #fff8ec 100%)' }}>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-3 mb-14 text-center"
          >
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#E25822]/70">— {lang === 'en' ? 'Latest Updates' : 'తాజా నవీకరణలు'} —</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#580000]">{t.announcements}</h2>
            <div className="divider-gold w-32" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {announcements.length > 0 ? (
              announcements.map((announce, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.12 }}
                  key={announce.id}
                  className="card-hover bg-white rounded-3xl border border-orange-100/80 shadow-md overflow-hidden flex flex-col"
                >
                  {/* Card top accent */}
                  <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #FFD700, #E25822, #C1440E)' }} />
                  <div className="p-7 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-5">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFF3B0, #FFE066)' }}>
                          <Megaphone size={22} className="text-[#C1440E]" />
                        </div>
                        <span className="text-[10px] font-black tracking-wider uppercase px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
                          ✓ {lang === 'en' ? 'Active' : 'సజీవం'}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-gray-800 mb-3 leading-snug">
                        {lang === 'en' ? announce.title : (announce.titleTe || announce.title)}
                      </h3>
                      <p className="text-gray-500 leading-relaxed text-sm">
                        {lang === 'en' ? announce.body : (announce.bodyTe || announce.body)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-semibold uppercase tracking-wide border-t border-gray-100 pt-5 mt-5">
                      <Sparkles size={11} className="text-[#FFD700]" />
                      {new Date(announce.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'te-IN', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 bg-white py-16 rounded-3xl border border-dashed border-orange-200 text-center">
                <div className="text-5xl mb-4">📢</div>
                <p className="text-gray-500 font-bold text-lg">{lang === 'en' ? 'No recent announcements.' : 'ప్రస్తుతం ఎలాంటి ప్రకటనలు లేవు.'}</p>
                <p className="text-gray-400 text-sm mt-2">{lang === 'en' ? 'Stay tuned for festival updates!' : 'ఉత్సవ వివరాల కోసం వేచి ఉండండి!'}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Festival Schedule Section */}
      <section id="schedule" className="py-12 md:py-16 px-6 relative bg-[#fffdf5] mandala-bg">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center gap-4 mb-6 text-center"
          >
            <span className="text-[#E25822] font-black tracking-widest uppercase text-xl md:text-2xl">{t.annualSchedule}</span>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#E25822] to-transparent rounded-full"></div>
            <p className="text-gray-500 text-sm mt-2">
              {lang === 'en'
                ? '65th Annual Mahabharatham Mahotsavam — Chenchugudi, Vedurukuppam Mandal'
                : '65వ సం॥ మహాభారత మహోత్సవం — చెంచుగుడి, వెదురుకుప్పం మండలం'}
            </p>
            {activeYearData?.pamphletUrl && (
              <a 
                href={activeYearData.pamphletUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 bg-[#580000] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-[#7A1500] hover:-translate-y-0.5 transition-all"
              >
                📥 {lang === 'en' ? 'Download Pamphlet' : 'కరపత్రం డౌన్‌లోడ్ చేయండి'}
              </a>
            )}
          </motion.div>

          {/* Highlight Banner */}
          <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-[#580000] to-[#8B0000] text-white text-center shadow-xl">
            <p className="text-2xl md:text-3xl font-black tracking-wide">
              {lang === 'en' ? '🗓️ Sri Mahabharata Mahotsava — Official Festival Dates: May 29 – June 7' : '🗓️ శ్రీ మహాభారత మహోత్సవ తేదీలు: మే 29 – జూన్ 7'}
            </p>
            <p className="text-orange-200 text-sm mt-2 font-medium">
              {lang === 'en'
                ? 'Dhwajarohanam (Flag Hoisting): May 29 · Harikatha: 1–5 PM Daily · Night Dramas: 9 PM – 5 AM'
                : 'ధ్వజారోహణ: మే 29 · హరికథా: మ.1–సా.5 రోజూ · రాత్రి నాటకాలు: రా.9–తె.5'}
            </p>
          </div>

          {/* Day-by-Day Schedule */}
          <div className="relative pl-6 md:pl-12 space-y-4 before:content-[''] before:absolute before:left-2.5 md:before:left-5 before:top-4 before:bottom-4 before:w-1 before:bg-gradient-to-b before:from-[#FFD700] before:via-[#E25822] before:to-transparent before:rounded-full before:opacity-50">
            {(activeYearData?.events || []).map((item: any, idx: number) => (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 md:p-6 rounded-3xl border transition-all group card-hover before:content-[''] before:absolute before:-left-6 md:before:-left-10 before:top-8 md:before:top-1/2 md:before:-translate-y-1/2 before:w-3 before:h-3 before:bg-[#FFD700] before:rounded-full before:border-2 before:border-[#580000] before:shadow-[0_0_10px_rgba(255,215,0,0.6)] before:z-10 ${item.highlight
                  ? 'bg-gradient-to-br from-[#fffdf5] to-orange-50/50 border-[#FFD700]/40 shadow-[0_8px_30px_rgba(226,88,34,0.12)] z-10'
                  : 'bg-white border-gray-100 shadow-sm hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]'
                  }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="text-2xl mt-0.5 shrink-0">{item.icon || '✨'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.highlight ? 'bg-orange-500 text-white' : 'bg-[#580000]/10 text-[#580000]'}`}>
                        {item.date}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">{lang === 'en' ? item.dayEn : item.dayTe}</span>
                    </div>
                    <p className={`font-bold text-sm md:text-base leading-snug ${item.highlight ? 'text-[#580000]' : 'text-gray-700'}`}>
                      {lang === 'en' ? item.eventEn : item.eventTe}
                    </p>
                    {(lang === 'en' ? item.sponsorEn : item.sponsorTe) && (
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <span className="text-orange-400">🙏</span>
                        <span>{lang === 'en' ? 'Organizers: ' : 'నిర్వాహకులు: '}{lang === 'en' ? item.sponsorEn : item.sponsorTe}</span>
                      </p>
                    )}
                  </div>
                </div>
                {item.fee && (
                  <div className="shrink-0 w-full sm:w-auto bg-[#580000] text-[#FFD700] rounded-xl px-4 py-2 text-center shadow-md font-bold text-xs flex sm:flex-col justify-between items-center sm:justify-center gap-0.5 border border-orange-300/30">
                    <span className="text-[10px] font-bold text-orange-200 tracking-wider uppercase">{lang === 'en' ? 'Entry Fee' : 'ప్రవేశ రుసుము'}</span>
                    <span className="text-base font-black tracking-wide text-white sm:mt-0.5">{item.fee}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>


        </div>
      </section>

      {/* ══ CULTURAL PROGRAMS SECTION ═══════════════════════ */}
      <section id="programs" className="py-12 md:py-16 px-6 relative" style={{ background: 'linear-gradient(180deg, #fffdf5 0%, #fff8ec 100%)' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,215,0,0.15) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-3 mb-10 text-center"
          >
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#E25822]/70">— {lang === 'en' ? 'Devotional & Cultural Events' : 'భక్తి మరియు సాంస్కృతిక కార్యక్రమాలు'} —</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-[#580000] flex items-center gap-2">
              <span className="text-orange-500">✨</span> {lang === 'en' ? 'Cultural Programs' : 'సాంస్కృతిక కార్యక్రమాలు'}
            </h2>
            <div className="divider-gold w-32" />
          </motion.div>

          {/* Premium Tab Navigation */}
          <div className="flex justify-center gap-2 mb-12 bg-orange-100/40 p-1.5 rounded-2xl border border-orange-200/50 max-w-md mx-auto">
            {[
              { id: 'harikatha', labelEn: 'Harikatha Mahotsavam', labelTe: 'హరికథా మహోత్సవం' },
              { id: 'dramas', labelEn: 'Night Dramas', labelTe: 'రాత్రి నాటకాలు' }
            ].map(tab => {
              const isActive = activeProgramTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveProgramTab(tab.id as any)}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 border-b-2 ${isActive
                      ? 'bg-gradient-to-r from-[#580000] to-[#7A1500] text-[#FFD700] shadow-lg hover:scale-[1.02] border-[#FFD700]'
                      : 'bg-white/40 backdrop-blur-sm text-gray-600 hover:text-[#580000] hover:bg-white/80 border-transparent shadow-sm'
                    }`}
                >
                  {lang === 'en' ? tab.labelEn : tab.labelTe}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div className="max-w-4xl mx-auto min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProgramTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {activeProgramTab === 'harikatha' ? (
                  <div className="bg-white border border-orange-100 rounded-3xl p-8 md:p-12 shadow-xl flex flex-col lg:flex-row gap-8 items-center">
                    {/* Left/Top Circle for Artist Icon/Graphics */}
                    <div className="relative shrink-0">
                      <div className="absolute -inset-2 bg-gradient-to-br from-[#FFD700] to-[#E25822] blur-lg rounded-full opacity-20 animate-pulse-glow"></div>
                      <div className="w-40 h-40 md:w-48 md:h-48 rounded-full p-1 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#E25822] shadow-xl relative z-10 overflow-hidden">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#fffdf5] bg-[#fffdf5]">
                          <img
                            src="/images/harikatha.png"
                            alt="Harikatha Performance"
                            className="w-full h-full object-cover object-center hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right/Bottom Content */}
                    <div className="flex-1 text-center lg:text-left text-gray-700">
                      <span className="inline-block bg-orange-50 text-[#E25822] text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-orange-200/50 mb-4">
                        {lang === 'en' ? 'Daily Ganam' : 'రోజువారీ హరికథా గానం'}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-black text-[#580000] mb-2">
                        {lang === 'en' ? 'Smt. G. Jyoshna Bhagavatarini' : 'జి. జ్యోష్ణ భాగవతారిణి'}
                      </h3>
                      <p className="text-[#E25822] font-semibold text-sm md:text-base mb-4 tracking-wide">
                        {lang === 'en' ? 'Chittoor Resident · Harikatha Gana Praveena · Natyamayuri · Ganakokila' : 'చిత్తూరు వాస్తవ్యురాలు హరికథా గాన ప్రవీణ, నాట్యమయూరి, గానకోకిల'}
                      </p>

                      <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                        {lang === 'en'
                          ? 'Harikathakalakshepamulu will be performed.'
                          : 'హరికథాకాల క్షేపములు జరుపబడును.'}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center border-t border-orange-100 pt-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E25822]">
                            <CalendarDays size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Festival Dates' : 'ఉత్సవ తేదీలు'}</p>
                            <p className="text-sm font-bold text-gray-800">May 29 – June 7 (మే 29 – జూన్ 7)</p>
                          </div>
                        </div>

                        <div className="hidden sm:block h-8 w-px bg-orange-100" />

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E25822]">
                            <Play size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Timing' : 'సమయం'}</p>
                            <p className="text-sm font-bold text-gray-800">{lang === 'en' ? '1:00 PM – 5:00 PM Daily' : 'ప్రతిరోజు మధ్యాహ్నం 1:00 – సాయంత్రం 5:00'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-orange-100 text-left text-xs">
                        <div className="p-4 bg-[#fffdf5] border border-orange-100/70 shadow-sm rounded-2xl flex flex-col gap-1">
                          <span className="font-bold text-[#580000]">{lang === 'en' ? '🎵 Troupe / వాయిద్య బృందము' : '🎵 వాయిద్య బృందము'}</span>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            {lang === 'en'
                              ? 'Harmonist: Valli Saheb Tabala: Ganapathi Shankar'
                              : 'హార్మోనిస్ట్: వల్లి సాహెబ్ తబల: గణపతి శంకర్'}
                          </p>
                        </div>
                        <div className="p-4 bg-[#fffdf5] border border-orange-100/70 shadow-sm rounded-2xl flex flex-col gap-1">
                          <span className="font-bold text-[#580000]">{lang === 'en' ? '🤝 Patron / విరాళ దాత' : '🤝 హరికథ విరాళ దాత'}</span>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            {lang === 'en'
                              ? 'Chi. Ravilla Dillibabu, Reddepalli (S/o Sri Ravilla Devarajulu Naidu)'
                              : 'శ్రీ రావిళ్ళ దేవరాజులు నాయుడు గారి కుమారుడు చి|| రావిళ్ళ డిల్లిబాబు, రెడ్డేపల్లి'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-orange-100 rounded-3xl p-8 md:p-12 shadow-xl flex flex-col lg:flex-row-reverse gap-8 items-center">
                    {/* Right/Top Circle for Drama Icon/Graphics */}
                    <div className="relative shrink-0">
                      <div className="absolute -inset-2 bg-gradient-to-br from-[#FFD700] to-orange-500 blur-lg rounded-full opacity-10 animate-pulse-glow"></div>
                      <div className="w-40 h-40 md:w-48 md:h-48 rounded-full p-1 bg-[#580000] shadow-xl relative z-10 overflow-hidden border border-orange-200/50">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-orange-100 bg-[#fffdf5]">
                          <img
                            src="/images/dramas.png"
                            alt="Night Drama Performance"
                            className="w-full h-full object-cover object-center hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Left/Bottom Content */}
                    <div className="flex-1 text-center lg:text-left text-gray-700">
                      <span className="inline-block bg-orange-50 text-[#E25822] text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-orange-200/50 mb-4">
                        {lang === 'en' ? 'Mythological Stage Drama' : 'పౌరాణిక రంగస్థల నాటకాలు'}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-black text-[#580000] mb-2">
                        {lang === 'en' ? 'Sri Venkateshwara Nataka Kalamandali' : 'శ్రీ వేంకటేశ్వరా నాటక కళామండలి'}
                      </h3>
                      <p className="text-[#E25822] font-semibold text-sm md:text-base mb-4 tracking-wide">
                        {lang === 'en' ? 'Performing Timeless Legends of Mahabharatham' : 'మహాభారత పౌరాణిక ఘట్టాల ప్రదర్శన'}
                      </p>

                      <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                        {lang === 'en'
                          ? 'Under the direction of Manager Sri Veerabhadra (Badri) Pileru, night dramas will be performed by talented artists.'
                          : 'మేనేజరు శ్రీ వీరభద్ర (బద్రి) పీలేరు గారి ఆధ్వర్యమున హేమాహేమీలైన కళాకారులచే రాత్రి నాటకములు జరుపబడును.'}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center border-t border-orange-100 pt-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E25822]">
                            <CalendarDays size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Show Dates' : 'ప్రదర్శన తేదీలు'}</p>
                            <p className="text-sm font-bold text-gray-800">May 29 – June 7 (మే 29 – జూన్ 7)</p>
                          </div>
                        </div>

                        <div className="hidden sm:block h-8 w-px bg-orange-100" />

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E25822]">
                            <Play size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Timings' : 'సమయాలు'}</p>
                            <p className="text-sm font-bold text-gray-800">{lang === 'en' ? '9:00 PM – 5:00 AM Nightly' : 'ప్రతిరోజు రాత్రి 9:00 నుండి ఉదయం 5:00 వరకు'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-orange-100 text-left text-xs">
                        <div className="p-4 bg-[#fffdf5] border border-orange-100/70 shadow-sm rounded-2xl flex flex-col gap-1">
                          <span className="font-bold text-[#580000]">{lang === 'en' ? '💼 Manager / మేనేజర్' : '💼 మేనేజర్'}</span>
                          <p className="text-gray-600 font-medium">
                            {lang === 'en' ? 'Sri Veerabhadra (Badri), Pileru' : 'శ్రీ వీరభద్ర (బద్రి), పీలేరు'}
                          </p>
                        </div>
                        <div className="p-4 bg-[#fffdf5] border border-orange-100/70 shadow-sm rounded-2xl flex flex-col gap-1">
                          <span className="font-bold text-[#580000]">{lang === 'en' ? '🎭 Artists / కళాకారులు' : '🎭 కళాకారులు'}</span>
                          <p className="text-gray-600 font-medium">
                            {lang === 'en'
                              ? 'Performed by renowned stage artists'
                              : 'హేమాహేమీలైన కళాకారులచే'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ══ DONORS SECTION ══════════════════════════════════ */}
      {/* ══ DONORS SECTION ═════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-[#fffdf5] mandala-bg border-t border-orange-100 relative overflow-hidden" id="donors">
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block bg-orange-100 text-[#580000] text-sm font-black uppercase tracking-widest px-4 py-2 rounded-full border border-orange-200 mb-4 shadow-sm">
              {lang === 'en' ? 'Special Acknowledgements' : 'ప్రత్యేక కృతజ్ఞతలు'}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#580000] mb-6 drop-shadow-sm font-display tracking-wide">
              {lang === 'en' ? 'Sponsors & Donors' : 'దాతలు & సహాయకులు'}
            </h2>
            <div className="w-24 h-1 bg-[#E25822] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {[
              {
                icon: '🎨',
                titleTe: 'దేవస్థానమునకు రీపెయింటింగ్ విరాళదాత (రూ. 90,000)',
                titleEn: 'Temple Repainting Donor (Rs. 90,000)',
                descTe: 'యర్రసాని షణ్ముగంరెడ్డి & శ్రీమతి లలిత, రెడ్డేపల్లి',
                descEn: 'Yarrasani Shanmugam Reddy & Smt. Lalitha, Reddepalli',
              },
              {
                icon: '🚰',
                titleTe: '2 1/2 పివిసి పైపులు విరాళదాత (107 పైపులు రూ. 40,000)',
                titleEn: '2 1/2 PVC Pipes Donor (107 Pipes Rs. 40,000)',
                descTe: 'రావిళ్ళ చిన్నస్వామి నాయుడు, రెడ్డేపల్లి',
                descEn: 'Raavilla Chinnaswamy Naidu, Reddepalli',
              },
              {
                icon: '🏺',
                titleTe: 'గుడికి 18 ఇత్తడి కలశం చెంబులు విరాళదాత',
                titleEn: '18 Brass Kalasam Vessels Donor',
                descTe: 'కీ||శే|| బండి రాజశేఖర్ రెడ్డి కుమారుడు బి. భరత్‌రెడ్డి, కుమార్తె హారిక, రెంటాలచేను',
                descEn: 'Late Bandi Rajasekhar Reddy Son B. Bharath Reddy, Daughter Harika, Rentalachenu',
              },
              {
                icon: '🔆',
                titleTe: 'గుడికి 6 LED లైట్స్ ఇచ్చిన దాత',
                titleEn: '6 LED Lights Donor',
                descTe: 'జి. చెంగల్రాయనాయుడు కుమారుడు నాగేష్నాయుడు & బ్రదర్స్, రెడ్డేపల్లి',
                descEn: 'G. Chengalrayanaidu Son Nageshnaidu & Brothers, Reddepalli',
              },
              {
                icon: '📜',
                titleTe: 'పత్రికలు ముద్రణ విరాళదాత',
                titleEn: 'Pamphlet Printing Donor',
                descTe: 'శ్రీపురం మాధవ రెడ్డి, చెంచుగుడి',
                descEn: 'Sripuram Madhava Reddy, Chenchugudi',
              }
            ].map((donor, idx) => (
              <div key={idx} className="bg-gradient-to-br from-[#fffdf5] to-[#FFD700]/10 border border-[#FFD700]/30 rounded-3xl p-6 shadow-[0_4px_20px_rgba(255,215,0,0.1)] hover:shadow-[0_10px_40px_rgba(226,88,34,0.15)] hover:-translate-y-2 transition-all duration-500 flex items-start gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-sm border border-[#FFD700]/40 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-inner">
                  {donor.icon}
                </div>
                <div>
                  <h4 className="font-bold text-[#E25822] mb-1 leading-snug">
                    {lang === 'en' ? donor.titleEn : donor.titleTe}
                  </h4>
                  <p className="text-gray-700 font-medium text-sm leading-relaxed">
                    {lang === 'en' ? donor.descEn : donor.descTe}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>      

      <section id="pooja-donors" className="py-12 md:py-16 px-6 relative" style={{ background: 'linear-gradient(180deg, #fffdf5 0%, #fff8ec 100%)' }}>
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col items-center gap-3 mb-12 text-center">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#E25822]/70">— {lang === 'en' ? 'Generous Contributors' : 'దేవస్థాన మహాదాతలు'} —</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-[#580000] flex items-center gap-2">
              <span className="text-orange-500">🙏</span> {lang === 'en' ? 'Divine Donors' : 'పూజా ఉభయ దాతలు'}
            </h2>
            <div className="divider-gold w-32" />
            <p className="text-gray-500 text-sm max-w-xl mt-2">
              {lang === 'en'
                ? 'We express our deepest gratitude to the devotees whose generous support sustains the daily poojas, festivals, and annadanam services.'
                : 'దేవస్థాన నిత్య పూజలు, వివిధ ఉత్సవాలు మరియు అన్నదాన కార్యక్రమాలకు ఆర్థిక సాయం అందిస్తూ సహకరిస్తున్న భక్త మహాశయులకు ధన్యవాదాలు.'}
            </p>
          </div>

          {/* Premium Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 bg-orange-100/40 p-2 rounded-2xl border border-orange-200/50 max-w-4xl mx-auto">
            {[
              { id: 'annadanam', labelEn: 'Annadanam', labelTe: 'అన్నదానం' },
              { id: 'yagnam', labelEn: 'Daily Yagnam', labelTe: 'యజ్ఞం & పూజలు' },
              { id: 'pournami', labelEn: 'Pournami Pooja', labelTe: 'పౌర్ణమి పూజలు' },
              { id: 'vijayadashami', labelEn: 'Vijayadashami Pooja', labelTe: 'విజయదశమి పూజలు' }
            ].map(tab => {
              const isActive = activeDonorTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDonorTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 ${isActive
                      ? 'bg-[#580000] text-[#FFD700] shadow-md hover:scale-[1.02]'
                      : 'bg-transparent text-gray-600 hover:text-[#580000] hover:bg-orange-200/30'
                    }`}
                >
                  {lang === 'en' ? tab.labelEn : tab.labelTe}
                </button>
              );
            })}
          </div>

          {/* Dynamic Content Panel */}
          <div className="max-w-4xl mx-auto min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDonorTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-xl"
              >
                {/* Vijayadashami Tab */}
                {activeDonorTab === 'vijayadashami' && (
                  <div>
                    <div className="text-center mb-6 border-b border-orange-50 pb-4">
                      <h4 className="text-lg font-black text-[#580000] uppercase tracking-wide">
                        {lang === 'en' ? 'Annual Vijayadashami Pooja Donors' : 'ప్రతి సంవత్సరం విజయదశమి పూజలు (దుర్గాష్టమి) జరిపించు దాతలు'}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {vijayadashamiDonors.map((donor, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -2 }}
                          className="bg-[#fffdf5] border-l-4 border-[#E25822] p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3 border-y border-r border-orange-100/70"
                        >
                          <span className="w-8 h-8 rounded-full bg-orange-100 text-[#E25822] flex items-center justify-center font-black text-xs shrink-0">{donor.n}</span>
                          <div>
                            <p className="text-gray-800 font-bold text-sm md:text-base leading-snug">{lang === 'en' ? donor.nameEn : donor.nameTe}</p>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">{lang === 'en' ? donor.locEn : donor.locTe}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pournami Tab */}
                {activeDonorTab === 'pournami' && (
                  <div>
                    <div className="text-center mb-6 border-b border-orange-50 pb-4">
                      <h4 className="text-lg font-black text-[#580000] uppercase tracking-wide">
                        {lang === 'en' ? 'Annual Pournami Pooja Donors' : 'ప్రతి సంవత్సరం పౌర్ణమి పూజలు జరిపించు దాతలు'}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pournamiDonors.map((donor, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -2 }}
                          className="bg-[#fffdf5] border-l-4 border-[#FFA500] p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3 border-y border-r border-orange-100/70"
                        >
                          <span className="px-3 py-1 bg-orange-100 text-[#E25822] rounded-lg font-black text-xs shrink-0">{lang === 'en' ? donor.monthEn : donor.monthTe}</span>
                          <div>
                            <p className="text-gray-800 font-bold text-sm md:text-base leading-snug">{lang === 'en' ? donor.nameEn : donor.nameTe}</p>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">{lang === 'en' ? donor.locEn : donor.locTe}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Krishnashtami Donor */}
                    <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 shadow-sm flex items-start gap-4">
                      <span className="text-3xl mt-1">🪈</span>
                      <div>
                        <p className="text-[#E25822] font-black text-xs md:text-sm uppercase tracking-wide mb-1">
                          {lang === 'en' ? 'Annual Krishnashtami Pooja Donor' : 'ప్రతి సం|| కృష్ణాష్టమి పూజ జరిపించు దాత'}
                        </p>
                        <p className="text-gray-800 font-bold text-sm md:text-base leading-snug">
                          {lang === 'en' ? "Late Sri Bandi Lakshmana Reddy's son B. Sarath Reddy" : 'కీ॥శే॥ బండి లక్ష్మిణరెడ్డి కుమారుడు బి. శరత్ రెడ్డి'}
                        </p>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">
                          {lang === 'en' ? 'Rentalacheenu' : 'రెంటాలచేను'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Daily Yagnam Tab */}
                {activeDonorTab === 'yagnam' && (
                  <div>
                    <div className="text-center mb-6 border-b border-orange-50 pb-4">
                      <h4 className="text-lg font-black text-[#580000] uppercase tracking-wide">
                        {lang === 'en' ? 'Daily Yagnam & Pooja Donors' : 'మహాభారత ఉత్సవ నిత్య యజ్ఞం, పూజ ఉభయదాతలు'}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(activeYearData?.sponsors || yagnamDonors).map((donor: any, idx: number) => (
                        <motion.div
                          key={donor.id || idx}
                          whileHover={{ y: -2 }}
                          className="bg-[#fffdf5] border-l-4 border-red-500 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-2 border-y border-r border-orange-100/70"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[#E25822] font-black text-xs">{donor.date || (lang === 'en' ? donor.dateEn : donor.dateTe)}</span>
                            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wide">({lang === 'en' ? donor.dayEn : donor.dayTe})</span>
                          </div>
                          <div>
                            <p className="text-gray-800 font-bold text-sm md:text-base leading-snug">{lang === 'en' ? donor.nameEn : donor.nameTe}</p>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">{lang === 'en' ? donor.locationEn || donor.locEn : donor.locationTe || donor.locTe}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Annadanam Tab */}
                {activeDonorTab === 'annadanam' && (
                  <div>
                    <div className="text-center mb-6 border-b border-orange-50 pb-4">
                      <h4 className="text-lg font-black text-[#580000] uppercase tracking-wide">
                        {lang === 'en' ? 'Annadanam (Food Distribution) Donors' : 'అన్నదాన వితరణ విరాళ దాతలు'}
                      </h4>
                    </div>
                    <div className="space-y-4">
                      {annadanamDonors.map((donor, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -2 }}
                          className="bg-[#fffdf5] border border-orange-100/70 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-3 relative overflow-hidden"
                        >
                          {/* Accent bar at the top */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] via-[#E25822] to-[#580000]" />
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-orange-50 text-[#E25822] rounded-lg font-black text-xs">{donor.date}</span>
                              <span className="text-gray-800 font-bold text-xs">({lang === 'en' ? donor.dayEn : donor.dayTe})</span>
                            </div>
                            <span className="px-3 py-1 bg-[#580000] text-[#FFD700] rounded-lg text-xs font-black tracking-wider uppercase">{lang === 'en' ? donor.timeEn : donor.timeTe}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-sm md:text-base mt-1 font-medium">{lang === 'en' ? donor.descEn : donor.descTe}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section id="maha-donors" className="py-12 md:py-16 px-6 relative bg-white border-b border-orange-100">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(226,88,34,0.15) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="w-16 h-16 mx-auto bg-orange-50 text-[#E25822] rounded-full flex items-center justify-center text-3xl shadow-sm mb-6 border border-orange-200">
            📜
          </div>
          <h2 className="font-display text-2xl md:text-4xl font-black text-[#580000] mb-4">
            {lang === 'en' ? 'Mahabharatha Yagnam Grand Donors' : 'మహాభారత యజ్ఞమునకు విరాళము ఇచ్చు దాతలు'}
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
            {lang === 'en' 
              ? 'Our heartfelt gratitude to the 150+ devotees who generously contributed towards the grand Mahabharatha Yagnam. Their divine contributions sustain our 65-year-old tradition.' 
              : 'మహాభారత యజ్ఞమునకు విశేషంగా విరాళములు అందించిన 150+ భక్త మహాశయులకు మా హృదయపూర్వక కృతజ్ఞతలు. మీ సహకారం ఈ 65 సంవత్సరాల ఉత్సవానికి శ్రీరామరక్ష.'}
          </p>
          
          <a 
            href="/pamphlet-2026.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#580000] px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-widest shadow-[0_8px_30px_rgba(255,215,0,0.4)] hover:scale-105 hover:shadow-[0_12px_40px_rgba(255,215,0,0.6)] transition-all duration-300"
          >
            📋 {lang === 'en' ? 'View Complete Official Donor List' : 'పూర్తి దాతల జాబితా (PDF) చూడండి'}
          </a>
        </div>
      </section>

      {/* Temple Committee Section */}
      <section id="committee" className="py-12 md:py-16 px-6 bg-gradient-to-b from-[#580000] to-[#3a0000] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #FFD700 0%, transparent 50%), radial-gradient(circle at 75% 75%, #FF6B00 0%, transparent 50%)' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="text-[#FFD700] font-black tracking-widest uppercase text-sm">{lang === 'en' ? 'TEMPLE STAFF / SERVICES' : 'దేవస్థాన సిబ్బంది'}</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-3">
              {lang === 'en' ? 'Temple Committee' : 'దేవస్థాన సిబ్బంది'}
            </h2>
            <div className="h-0.5 w-20 bg-[#FFD700] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                role: 'పురోహితులు',
                roleEn: 'Head Priests',
                nameTe: 'శ్రీ వై.వి.ఆర్. గౌరీశంకర్ శర్మ, కె.వి.యం. అగ్రహారం',
                nameEn: 'Sri Y.V.R. Gowrishankar Sharma, K.V.M. Agraharam',
                name2Te: 'శ్రీ వై.ఎస్.ఆర్. హరి శర్మ, కె.వి.యం. అగ్రహారం',
                name2En: 'Sri Y.S.R. Hari Sharma, K.V.M. Agraharam',
                icon: '🪔'
              },
              {
                role: 'అర్చకులు',
                roleEn: 'Temple Priest',
                nameTe: 'శ్రీ కేశవాచారి, చెంచుగుడి',
                nameEn: 'Sri Keshavachari, Chenchugudi',
                name2Te: '',
                name2En: '',
                icon: '🙏'
              },
              {
                role: 'ఆస్థాన మడవలి',
                roleEn: 'Court Drummer',
                nameTe: 'శ్రీ కృష్ణయ్య, చెంచుగుడి',
                nameEn: 'Sri Krishnaiah, Chenchugudi',
                name2Te: '',
                name2En: '',
                icon: '🥁'
              },
              {
                role: 'ఆస్థాన తోటి',
                roleEn: 'Traditional Announcer',
                nameTe: 'శ్రీ జానకిరామ్, చెంచుగుడి',
                nameEn: 'Sri Janakiram, Chenchugudi',
                name2Te: '',
                name2En: '',
                icon: '📯'
              },
              {
                role: 'ఆస్థాన మంగళమేళం',
                roleEn: 'Traditional Instrumentalists',
                nameTe: 'శ్రీ ఎ. మునస్వామి, గుంతలచేను',
                nameEn: 'Sri A. Munaswamy, Guntalacheenu',
                name2Te: '',
                name2En: '',
                icon: '🎺'
              },
              {
                role: 'ఆస్థాన పంబలి',
                roleEn: 'Temple Assistants',
                nameTe: 'శ్రీ బాలకృష్ణ, పెనుమూరు',
                nameEn: 'Sri Balakrishna, Penumuru',
                name2Te: '',
                name2En: '',
                icon: '🍳'
              },
              {
                role: 'త్రాగు నీటి సరఫరా',
                roleEn: 'Drinking Water Providers',
                nameTe: 'లేట్ నాగరాజ ఆచారి కుమారులు, చెంచుగుడి',
                nameEn: "Late Nagaraja Achari's sons, Chenchugudi",
                name2Te: 'బోడిరెడ్డి శివశంకర్ రెడ్డి, చెంచుగుడి మరియు రావిళ్ళ దేవరాజులు నాయుడు, రెడ్డేపల్లి',
                name2En: 'Bodireddy Shivashankar Reddy, Chenchugudi & Ravilla Devarajulu Naidu, Reddepalli',
                icon: '💧'
              },
              {
                role: 'విద్యుద్దీపాలంకరణ',
                roleEn: 'Lighting & Decoration',
                nameTe: 'రవి సౌండ్ సర్వీస్, మొరవ',
                nameEn: 'Ravi Sound Service, Morava',
                name2Te: 'ప్రొప్రైటర్: చిన్నబ్బ, యస్.యస్. కొండ',
                name2En: 'Proprietor: Chinnabba, S.S. Konda',
                icon: '💡'
              },
              {
                role: 'గుడివద్ద విద్యుత్ మెయింటెనెన్స్',
                roleEn: 'Electrical Maintenance',
                nameTe: 'దాము, లైన్‌మెన్',
                nameEn: 'Damu, Lineman',
                name2Te: 'మరియు హేమ శేఖర్ రెడ్డి, చెంచుగుడి',
                name2En: 'and Hema Shekhar Reddy, Chenchugudi',
                icon: '⚡'
              },
            ].map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{member.icon}</span>
                  <div>
                    <p className="text-[#FFD700] text-xs font-black uppercase tracking-wider mb-1">
                      {lang === 'en' ? member.roleEn : member.role}
                    </p>
                    <p className="text-white font-bold text-sm">{lang === 'en' ? member.nameEn : member.nameTe}</p>
                    {(member.name2Te || member.name2En) && <p className="text-white font-bold text-sm mt-0.5">{lang === 'en' ? member.name2En : member.name2Te}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>


          {/* Dharmakartha & Committee Members Grid */}
          <div className="mt-16 mb-12">
            <div className="text-center mb-12">
              <span className="text-[#FFD700] font-black tracking-widest uppercase text-sm">{lang === 'en' ? 'HONORARY ORGANIZERS' : 'గౌరవప్రదమైన నిర్వాహకులు'}</span>
              <h2 className="text-3xl md:text-4xl font-black mt-2 mb-4 text-white">
                {lang === 'en' ? 'Chief Organizers & Trustees' : 'ప్రధాన నిర్వాహకులు & ధర్మకర్తలు'}
              </h2>
              <div className="h-0.5 w-24 bg-[#FFD700] mx-auto rounded-full" />
            </div>

            {(() => {
              const renderMember = (member: any, idx: number, isFounder: boolean = false) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="relative mb-5">
                    <div className={`${isFounder ? 'w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-[#FFD700] ring-4 ring-[#FFD700]/30 ring-offset-4 ring-offset-[#580000] shadow-[0_0_50px_rgba(255,215,0,0.6)] group-hover:shadow-[0_0_80px_rgba(255,215,0,0.8)]' : 'w-36 h-36 md:w-40 md:h-40 rounded-full border-[3px] border-[#FFD700]/50 group-hover:border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.15)] group-hover:shadow-[0_0_50px_rgba(255,215,0,0.5)]'} transition-all duration-500 bg-gradient-to-br from-white/10 to-transparent overflow-hidden flex items-center justify-center relative group-hover:-translate-y-2`}>
                      {/* Profile Image */}
                      {member.image ? (
                        <img src={member.image} alt={lang === 'en' ? member.nameEn : member.nameTe} className={`w-full h-full object-cover ${member.imgClasses || 'object-center'} rounded-full relative z-10 shadow-inner`} />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#580000] via-[#8B0000] to-[#3a0000] flex items-center justify-center rounded-full shadow-inner z-10">
                          <User size={isFounder ? 72 : 56} className="text-[#FFD700]/40 group-hover:text-[#FFD700] group-hover:scale-110 transition-all duration-500" />
                        </div>
                      )}
                    </div>
                    {/* Decorative badge */}
                    <div className={`absolute ${isFounder ? '-bottom-4 px-8 py-2.5 text-[14px] shadow-[0_0_20px_rgba(255,215,0,0.4)]' : '-bottom-3 px-5 py-1.5 text-[11px] shadow-xl'} left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#580000] rounded-full font-black uppercase tracking-widest border-2 border-[#580000] whitespace-nowrap z-20 transition-transform group-hover:scale-105`}>
                      {lang === 'en' ? member.roleEn : member.role}
                    </div>
                  </div>

                  <div className="mt-4 px-2">
                    <h3 className={`text-white font-black ${isFounder ? 'text-2xl mb-2' : 'text-xl mb-1.5'} leading-snug group-hover:text-[#FFD700] transition-colors`}>{lang === 'en' ? member.nameEn : member.nameTe}</h3>
                    {member.descTe && (
                      <p className={`text-white/70 ${isFounder ? 'text-base' : 'text-sm'} leading-relaxed`}>{lang === 'en' ? member.descEn : member.descTe}</p>
                    )}
                  </div>
                </motion.div>
              );

              return (
                <>
                  <div className="flex justify-center mb-16">
                    {renderMember({
                      nameTe: 'కీ॥శే॥ శ్రీ పూల కృష్ణారెడ్డి గారు',
                      nameEn: 'Late Sri Poola Krishnareddy Garu',
                      descTe: 'రెంటాలచేను',
                      descEn: 'Rentalacheenu',
                      role: 'వ్యవస్థాపకులు & ధర్మకర్త',
                      roleEn: 'Founder & Trustee',
                      image: '/committee/0.jpg',
                      imgClasses: 'object-cover object-[50%_15%] scale-[1.1]'
                    }, 0, true)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6">
                    {[
                      {
                        nameTe: 'శ్రీ పూల పట్టాభి రామారెడ్డి గారు',
                        nameEn: 'Sri Poola Pattabhi Ramareddy',
                        descTe: 'S/o. కీ॥శే॥ శ్రీ పూల కృష్ణారెడ్డి గారు, రెంటాలచేను',
                        descEn: 'S/o. Late Sri Poola Krishnareddy, Rentalacheenu',
                        role: 'ధర్మకర్త',
                        roleEn: 'Chief Trustee',
                        image: '/committee/1.jpg',
                        imgClasses: 'object-cover object-[50%_10%] scale-110'
                      },
                      {
                        nameTe: 'శ్రీ పూల వెంకట్రామారెడ్డి గారు',
                        nameEn: 'Sri Poola Venkatramareddy',
                        descTe: 'S/o. కీ॥శే॥ శ్రీ పూల కృష్ణారెడ్డి గారు, రెంటాలచేను',
                        descEn: 'S/o. Late Sri Poola Krishnareddy, Rentalacheenu',
                        role: 'ధర్మకర్త',
                        roleEn: 'Trustee',
                        image: '/committee/2.jpg',
                        imgClasses: 'object-cover object-[50%_33%] scale-[1.15]'
                      },
                      {
                        nameTe: 'శ్రీ పూల అనిల్ రెడ్డి గారు',
                        nameEn: 'Sri Poola Anil Reddy',
                        descTe: 'S/o. శ్రీ పూల పట్టాభి రామారెడ్డి గారు, రెంటాలచేను',
                        descEn: 'S/o. Sri Poola Pattabhi Ramareddy, Rentalacheenu',
                        role: 'నిర్వాహకులు',
                        roleEn: 'Organizer',
                        image: '/committee/4.jpg',
                        imgClasses: 'object-cover object-[50%_35%] scale-[1.3]'
                      },
                      {
                        nameTe: 'శ్రీ పూల యశ్వంత్ రెడ్డి గారు',
                        nameEn: 'Sri Poola Yashwanth Reddy',
                        descTe: 'S/o. శ్రీ పూల వెంకట్రామారెడ్డి గారు, రెంటాలచేను',
                        descEn: 'S/o. Sri Poola Venkatramareddy, Rentalacheenu',
                        role: 'నిర్వాహకులు',
                        roleEn: 'Organizer',
                        image: '/committee/3.jpg',
                        imgClasses: 'object-cover object-top origin-top scale-[1.25]'
                      },
                    ].map((member, idx) => renderMember(member, idx + 1, false))}
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      </section>



      {/* Interactive Contribution Section (Samaarpana) temporarily removed */}

      {/* Photo & Video Gallery Section */}
      <section id="gallery" className="py-12 md:py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-4 mb-16 text-center">
            <span className="text-[#E25822] font-black tracking-widest uppercase text-xl md:text-2xl">
              {lang === 'en' ? 'Festival Media Gallery' : 'ఉత్సవ గ్యాలరీ'}
            </span>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#E25822] to-transparent rounded-full"></div>
            <p className="text-gray-500 text-sm mt-2 max-w-lg">
              {lang === 'en'
                ? 'Relive the divine moments of Chenchugudi Mahabharatham through photos and videos organized by day.'
                : 'చెంచుగుడి మహాభారత పవిత్ర ఘట్టాలను రోజువారీగా ఫోటోలు మరియు వీడియోల రూపంలో వీక్షించండి.'}
            </p>
          </div>

          {galleryImages.length > 0 ? (
            <div className="space-y-10">
              {/* Simple Masonry Grid for Recent Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {galleryImages.map((img, idx) => {
                  const getYoutubeThumbnail = (url: string) => {
                    if (!url) return '';
                    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
                    const videoId = match ? match[1] : null;
                    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
                  };
                  return (
                  <div
                    key={img.id}
                    onClick={() => openLightbox(galleryImages, idx)}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative aspect-[4/3]"
                  >
                    {img.mediaType === 'YOUTUBE' ? (
                      <div className="w-full h-full relative bg-black">
                        <img src={getYoutubeThumbnail(img.videoUrl) || img.imageUrl} alt={img.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play size={24} className="text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </div>
                    ) : img.mediaType === 'VIDEO' || img.mediaType === 'video' || (img.videoUrl && img.videoUrl.trim() !== '') || (img.imageUrl && img.imageUrl.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
                      <div className="w-full h-full relative bg-black">
                        <video src={img.videoUrl || img.imageUrl} className="w-full h-full object-cover" preload="metadata" muted />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                            <Play size={24} className="text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="text-white font-bold text-sm leading-tight drop-shadow-md">
                        {img.title}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* View Full Gallery Button */}
              <div className="text-center pt-8">
                <Link href="/gallery" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#E25822] hover:bg-[#c44a1a] text-white rounded-full font-black text-lg tracking-widest uppercase transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                  {lang === 'en' ? 'Explore Full Gallery' : 'పూర్తి గ్యాలరీని అన్వేషించండి'}
                  <ChevronRight size={24} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 overflow-hidden border border-gray-100">
                  <ImageIcon size={48} className="opacity-50" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ LIGHTBOX MODAL ════════════════════════ */}
      <AnimatePresence>
        {lightboxIndex !== null && lightboxItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-[110]"
            >
              <X size={28} />
            </button>

            {lightboxItems.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length); }}
                  className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-3 md:p-6 transition-colors z-[110]"
                >
                  <span className="text-4xl md:text-6xl">❮</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % lightboxItems.length); }}
                  className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-3 md:p-6 transition-colors z-[110]"
                >
                  <span className="text-4xl md:text-6xl">❯</span>
                </button>
              </>
            )}

            <div className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center px-4 md:px-20" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const item = lightboxItems[lightboxIndex];
                const isYoutube = item.mediaType === 'YOUTUBE';
                const isVideo = item.mediaType === 'VIDEO' || item.mediaType === 'video' ||
                  (!isYoutube && (item.videoUrl || /\.(mp4|webm|mov|avi|mkv)/i.test(item.imageUrl)));
                const videoSrc = item.videoUrl || item.imageUrl;

                if (isYoutube) return (
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${item.videoUrl?.split("v=")[1]?.split("&")[0]}?autoplay=1`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                );

                if (isVideo) return (
                  <div className="w-full max-h-[80vh] rounded-xl overflow-hidden bg-black shadow-2xl flex items-center justify-center">
                    <video
                      key={videoSrc}
                      src={videoSrc}
                      className="max-w-full max-h-[80vh] object-contain"
                      controls
                      autoPlay
                      playsInline
                    />
                  </div>
                );

                return (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                  />
                );
              })()}
              
              <div className="text-center mt-6">
                <h3 className="text-white text-xl font-bold">{lightboxItems[lightboxIndex].title}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {lightboxItems[lightboxIndex].eventName}
                </p>
                <p className="text-white/30 text-xs mt-2">
                  {lightboxIndex + 1} / {lightboxItems.length}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ══ CONTACT & SUPPORT SECTION ════════════════════════ */}
      <section id="contact" className="py-12 md:py-16 px-6 relative bg-gradient-to-b from-[#fffdf5] to-[#fff5e6]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#E25822] font-black tracking-widest uppercase text-sm">మమ్మల్ని సంప్రదించండి</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-4 text-[#580000]">
              {lang === 'en' ? 'Contact & Support' : 'సంప్రదింపులు & విరాళాలు'}
            </h2>
            <div className="h-0.5 w-24 bg-[#E25822] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Map */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#E25822]">
                  <MapPin size={20} />
                </div>
                <h3 className="font-black text-lg text-gray-800">{lang === 'en' ? 'Location' : 'ప్రదేశం'}</h3>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden bg-gray-100 relative min-h-[200px]">
                {/* Embed Google Map for Vedurukuppam Mandal, Chenchugudi */}
                <iframe
                  src="https://maps.google.com/maps?q=13.3977905,79.2805277&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, position: 'absolute', inset: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <p className="mt-4 text-gray-600 text-sm font-bold text-center">
                {lang === 'en' ? 'Chenchugudi, Vedurukuppam Mandal, Tirupati Dist.' : 'చెంచుగుడి, వెదురుకుప్పం మండలం, తిరుపతి జిల్లా.'}
              </p>
            </div>

            {/* WhatsApp Updates */}
            <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-3xl p-6 shadow-xl border border-white/20 flex flex-col h-full text-white text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <MessageCircle size={120} />
              </div>
              <div className="flex justify-center mb-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg group-hover:bg-white/30 transition-colors">
                  <MessageCircle size={32} />
                </div>
              </div>
              <h3 className="font-black text-2xl mb-2 relative z-10 text-white drop-shadow-md">
                {lang === 'en' ? 'Official WhatsApp Group' : 'అధికారిక వాట్సాప్ గ్రూప్'}
              </h3>
              <p className="text-white/90 text-sm mb-6 relative z-10 leading-relaxed font-medium">
                {lang === 'en' 
                  ? 'Join our community group for daily photos, live stream links, and important festival announcements.' 
                  : 'రోజువారీ ఫోటోలు, లైవ్ స్ట్రీమ్ లింక్స్ మరియు ముఖ్యమైన ప్రకటనల కోసం మా గ్రూప్‌లో చేరండి.'}
              </p>

              <div className="mt-auto relative z-10 w-full">
                <a href="https://chat.whatsapp.com/Lb73DFyuD64FGuR6b0lRBY" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-white text-[#128C7E] py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                  {lang === 'en' ? 'Join Group' : 'గ్రూప్‌లో చేరండి'}
                </a>
              </div>
            </div>

            {/* Contact & Social */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#E25822]">
                    <Phone size={20} />
                  </div>
                  <h3 className="font-black text-lg text-gray-800">{lang === 'en' ? 'Contact Us' : 'సంప్రదించండి'}</h3>
                </div>

                <div className="space-y-4">
                  <a href="tel:+919999999999" className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#E25822] group-hover:text-white transition-colors">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{lang === 'en' ? 'Committee Office' : 'కమిటీ ఆఫీస్'}</p>
                      <p className="text-gray-800 font-black">+91 99999 99999</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">{lang === 'en' ? 'Follow Updates Live' : 'లైవ్ అప్‌డేట్స్'}</h4>
                <div className="flex gap-4">
                  <a href="#" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors font-bold text-sm">
                    <Play size={18} /> YouTube
                  </a>
                  <a href="#" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors font-bold text-sm">
                    <Users size={18} /> Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════ */}
      <footer className="bg-[#1a0000] text-white pt-12 pb-6 px-6 border-t border-[#FFD700]/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 100%, #FFD700 0%, transparent 50%)' }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="flex items-center gap-3">
              <span className="text-4xl text-[#FFD700] om-shadow">ॐ</span>
              <div>
                <p className={`font-display font-bold text-xl text-white leading-none ${lang === 'en' ? 'tracking-widest' : 'tracking-normal'}`}>
                  {lang === 'en' ? 'CHENCHUGUDI' : 'చెంచుగుడి'}
                </p>
                <p className={`text-xs text-[#FFD700] ${lang === 'en' ? 'tracking-[0.3em] uppercase' : 'tracking-normal mt-1'}`}>
                  {lang === 'en' ? 'Mahabharatham' : 'మహాభారతం'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-white/60">
              <a href="#home" className="hover:text-[#FFD700] transition-colors">{lang === 'en' ? 'Home' : 'హోమ్'}</a>
              <a href="#schedule" className="hover:text-[#FFD700] transition-colors">{lang === 'en' ? 'Schedule' : 'పట్టిక'}</a>
              <Link href="/gallery" className="hover:text-[#FFD700] transition-colors">{lang === 'en' ? 'Gallery' : 'గ్యాలరీ'}</Link>
              <Link href="/login" className="hover:text-[#FFD700] transition-colors">{lang === 'en' ? 'Admin Login' : 'అడ్మిన్ లాగిన్'}</Link>
            </div>
          </div>


          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40 font-semibold tracking-wider">
            <p>
              &copy; {new Date().getFullYear()} {lang === 'en' ? 'Chenchugudi Mahabharatham. All Rights Reserved.' : 'చెంచుగుడి మహాభారతం. సర్వ హక్కులు ప్రత్యేకించబడినవి.'}
            </p>
            <p className="flex items-center gap-1">
              {lang === 'en' ? 'Made with' : 'రూపొందించినది'} <Heart size={12} className="text-[#E25822] mx-1" /> {lang === 'en' ? 'by Devotees' : 'భక్తులచే'}
            </p>
          </div>
        </div>
      </footer>
      {/* Website Liking Feedback Widget */}
      <AnimatePresence>
        {showFeedbackWidget && !hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 left-4 md:left-8 z-[90] max-w-sm bg-gradient-to-br from-[#580000] to-[#3a0000] text-white p-5 rounded-3xl border-2 border-[#FFD700]/35 shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] via-[#E25822] to-[#580000]" />
            
            <AnimatePresence mode="wait">
              {!feedbackSuccess ? (
                <motion.div
                  key="vote-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3.5"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-display font-black text-base text-[#FFD700] leading-snug">
                      {lang === 'en' 
                        ? 'Do you like our Mahabharatham website?' 
                        : 'మా దేవస్థాన వెబ్‌సైట్ మీకు నచ్చిందా?'}
                    </h3>
                    <button 
                      onClick={() => setShowFeedbackWidget(false)}
                      className="text-white/40 hover:text-white transition-colors text-sm font-bold bg-white/5 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <p className="text-white/70 text-xs leading-relaxed">
                    {lang === 'en'
                      ? 'Your feedback helps the temple committee improve digital resources for devotees globally.'
                      : 'భక్తులకు మరింత మెరుగైన డిజిటల్ సేవలు అందించడానికి మీ విలువైన అభిప్రాయాన్ని తెలపండి.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    <button
                      onClick={() => handleVoteSubmit(true)}
                      disabled={submittingVote}
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#580000] font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all disabled:opacity-50"
                    >
                      👍 {lang === 'en' ? 'Yes, Like' : 'నచ్చింది'}
                    </button>
                    <button
                      onClick={() => handleVoteSubmit(false)}
                      disabled={submittingVote}
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-xs uppercase tracking-wider border border-white/10 hover:scale-[1.03] transition-all disabled:opacity-50"
                    >
                      👎 {lang === 'en' ? 'No' : 'నచ్చలేదు'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="thank-you"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-4 gap-3"
                >
                  <span className="text-4xl animate-bounce">🙏</span>
                  <h4 className="font-display font-black text-lg text-[#FFD700]">
                    {lang === 'en' ? 'Thank You!' : 'ధన్యవాదాలు!'}
                  </h4>
                  <p className="text-white/80 text-xs leading-relaxed max-w-[240px]">
                    {lang === 'en'
                      ? 'We recorded your blessing. Have a divine day!'
                      : 'మీ అమూల్యమైన స్పందన నమోదైనది. దైవానుగ్రహం కలగాలని ఆకాంక్షిస్తున్నాం!'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Access Denied Toast Notification */}
      <AuthErrorAlert lang={lang} />

      {/* Push Notification Prompt */}
      <AnimatePresence>
        {showPushPrompt && isPushSupported && !isPushSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[90vw] bg-white text-gray-900 p-5 rounded-3xl border border-gray-100 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#25D366]" />
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-[#25D366]">
                  <Bell size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-sm mb-1">{lang === 'en' ? 'Get Live Notifications!' : 'లైవ్ నోటిఫికేషన్స్ పొందండి!'}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {lang === 'en' ? 'Allow notifications to know the moment the festival events go LIVE on YouTube.' : 'ఉత్సవ కార్యక్రమాలు యూట్యూబ్‌లో లైవ్‌లో ఉన్న వెంటనే నోటిఫికేషన్స్ పొందండి.'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={subscribeToPushNotifications}
                  className="bg-[#25D366] text-white font-black text-xs py-2.5 rounded-xl uppercase tracking-wider hover:bg-[#1da851] transition-colors"
                >
                  {lang === 'en' ? 'Allow' : 'అనుమతించు'}
                </button>
                <button
                  onClick={handleDismissPushPrompt}
                  className="bg-gray-50 text-gray-600 font-bold text-xs py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {lang === 'en' ? 'Later' : 'తరువాత'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SUBCOMPONENTS ───────────────────────────────────────────────────────

function AuthErrorAlertContent({ lang }: { lang: "en" | "te" }) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (error === "unauthorized") {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!visible) return null;

  return (
    <div className="fixed top-24 right-6 z-[200] max-w-md bg-red-600 text-white p-5 rounded-2xl shadow-2xl border border-red-500 flex items-start gap-4">
      <div className="text-2xl mt-0.5">⚠️</div>
      <div className="flex-1">
        <p className="font-bold text-sm">{lang === 'en' ? 'Access Denied' : 'ప్రవేశం నిరాకరించబడింది'}</p>
        <p className="text-xs text-red-100 mt-1 leading-relaxed">
          {lang === 'en'
            ? 'Your email address is not whitelisted for the Admin Panel. Please contact the project administrator to request access.'
            : 'మీ ఈమెయిల్ అడ్మిన్ ప్యానెల్ కోసం అనుమతించబడలేదు. దయచేసి ప్రాజెక్ట్ అడ్మినిస్ట్రేటర్‌ను సంప్రదించి ప్రవేశం పొందండి.'}
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-white/60 hover:text-white font-bold ml-2 text-sm leading-none"
      >
        ✕
      </button>
    </div>
  );
}

function AuthErrorAlert({ lang }: { lang: "en" | "te" }) {
  return (
    <Suspense fallback={null}>
      <AuthErrorAlertContent lang={lang} />
    </Suspense>
  );
}


