import React, { useEffect, useMemo, useRef, useState } from "react"
import QRCodeStyling from "qr-code-styling"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Download,
  Link2,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  MapPin,
  CalendarDays,
  ContactRound,
  FileText,
  Smartphone,
  Building2,
  QrCode,
} from "lucide-react"

const qrTypes = [
  { key: "url", label: "Website URL", icon: Link2 },
  { key: "text", label: "Plain Text", icon: FileText },
  { key: "email", label: "Email", icon: Mail },
  { key: "phone", label: "Phone", icon: Phone },
  { key: "sms", label: "SMS", icon: MessageSquare },
  { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { key: "wifi", label: "Wi-Fi", icon: Wifi },
  { key: "geo", label: "Location", icon: MapPin },
  { key: "vcard", label: "vCard", icon: ContactRound },
  { key: "event", label: "Calendar Event", icon: CalendarDays },
  { key: "file", label: "File / PDF URL", icon: FileText },
  { key: "app", label: "App Download", icon: Smartphone },
  { key: "company", label: "Company Profile", icon: Building2 },
]

const defaultFields = {
  url: { url: "https://example.com" },
  text: { text: "Hello from your company" },
  email: {
    email: "hello@example.com",
    subject: "Hello",
    body: "I'd like to get in touch.",
  },
  phone: { phone: "+971500000000" },
  sms: { phone: "+971500000000", message: "Hello" },
  whatsapp: { phone: "971500000000", message: "Hello" },
  wifi: {
    ssid: "Office WiFi",
    password: "password123",
    encryption: "WPA",
    hidden: false,
  },
  geo: { latitude: "25.2048", longitude: "55.2708", query: "Dubai Office" },
  vcard: {
    firstName: "John",
    lastName: "Doe",
    company: "Example LLC",
    title: "Sales Manager",
    phone: "+971500000000",
    mobile: "+971500000000",
    email: "john@example.com",
    website: "https://example.com",
    address: "Dubai, UAE",
    note: "Scan to save contact",
  },
  event: {
    title: "Company Meeting",
    description: "Quarterly review meeting",
    location: "Dubai HQ",
    start: "2026-04-21T10:00",
    end: "2026-04-21T11:00",
  },
  file: { url: "https://example.com/brochure.pdf" },
  app: {
    ios: "https://apps.apple.com/app/id000000000",
    android: "https://play.google.com/store/apps/details?id=com.example.app",
    fallback: "https://example.com/app",
  },
  company: {
    companyName: "Example LLC",
    website: "https://example.com",
    phone: "+97140000000",
    email: "hello@example.com",
    address: "Dubai, UAE",
    linkedin: "https://linkedin.com/company/example",
    instagram: "https://instagram.com/example",
  },
}

const colorPresets = [
  { name: "Classic", dark: "#000000", light: "#ffffff" },
  { name: "Ocean", dark: "#0f172a", light: "#e0f2fe" },
  { name: "Forest", dark: "#14532d", light: "#f0fdf4" },
  { name: "Royal", dark: "#312e81", light: "#eef2ff" },
  { name: "Burgundy", dark: "#7f1d1d", light: "#fef2f2" },
]

function pad(num: number) {
  return String(num).padStart(2, "0")
}

function toICSDate(localDateString: string) {
  if (!localDateString) return ""
  const d = new Date(localDateString)
  if (Number.isNaN(d.getTime())) return ""
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  )
}

function escapeVCard(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
}

function buildQRData(type: string, fields: any) {
  switch (type) {
    case "url":
      return fields.url || ""

    case "text":
      return fields.text || ""

    case "email": {
      const email = fields.email || ""
      const params = new URLSearchParams()
      if (fields.subject) params.set("subject", fields.subject)
      if (fields.body) params.set("body", fields.body)
      const qs = params.toString()
      return `mailto:${email}${qs ? `?${qs}` : ""}`
    }

    case "phone":
      return `tel:${fields.phone || ""}`

    case "sms": {
      const phone = fields.phone || ""
      const body = encodeURIComponent(fields.message || "")
      return `sms:${phone}${body ? `?body=${body}` : ""}`
    }

    case "whatsapp": {
      const phone = (fields.phone || "").replace(/[^\d]/g, "")
      const text = encodeURIComponent(fields.message || "")
      return `https://wa.me/${phone}${text ? `?text=${text}` : ""}`
    }

    case "wifi": {
      const ssid = fields.ssid || ""
      const password = fields.password || ""
      const encryption = fields.encryption || "WPA"
      const hidden = fields.hidden ? "true" : "false"
      return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`
    }

    case "geo": {
      const lat = fields.latitude || ""
      const lng = fields.longitude || ""
      const query = fields.query ? `?q=${encodeURIComponent(fields.query)}` : ""
      return `geo:${lat},${lng}${query}`
    }

    case "vcard": {
      const fullName = [fields.firstName, fields.lastName]
        .filter(Boolean)
        .join(" ")
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${escapeVCard(fields.lastName)};${escapeVCard(fields.firstName)};;;`,
        `FN:${escapeVCard(fullName)}`,
        `ORG:${escapeVCard(fields.company)}`,
        `TITLE:${escapeVCard(fields.title)}`,
        `TEL;TYPE=WORK,VOICE:${escapeVCard(fields.phone)}`,
        `TEL;TYPE=CELL:${escapeVCard(fields.mobile)}`,
        `EMAIL:${escapeVCard(fields.email)}`,
        `URL:${escapeVCard(fields.website)}`,
        `ADR;TYPE=WORK:;;${escapeVCard(fields.address)};;;;`,
        `NOTE:${escapeVCard(fields.note)}`,
        "END:VCARD",
      ].join("\n")
    }

    case "event": {
      const uid = `event-${Date.now()}@qrstudio.local`
      return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//QR Studio//EN",
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${toICSDate(new Date().toISOString())}`,
        `DTSTART:${toICSDate(fields.start)}`,
        `DTEND:${toICSDate(fields.end)}`,
        `SUMMARY:${fields.title || ""}`,
        `DESCRIPTION:${fields.description || ""}`,
        `LOCATION:${fields.location || ""}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\n")
    }

    case "file":
      return fields.url || ""

    case "app": {
      const lines = [
        "App Download",
        fields.ios ? `iPhone: ${fields.ios}` : "",
        fields.android ? `Android: ${fields.android}` : "",
        fields.fallback ? `Website: ${fields.fallback}` : "",
      ].filter(Boolean)
      return lines.join("\n")
    }

    case "company": {
      return [
        fields.companyName,
        fields.website,
        `Phone: ${fields.phone}`,
        `Email: ${fields.email}`,
        `Address: ${fields.address}`,
        `LinkedIn: ${fields.linkedin}`,
        `Instagram: ${fields.instagram}`,
      ]
        .filter(Boolean)
        .join("\n")
    }

    default:
      return ""
  }
}

function FieldRow({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function MultiLineRow({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label>{label}</Label>
      <Textarea
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
    </div>
  )
}

export default function App() {
  const [type, setType] = useState("url")
  const [fields, setFields] = useState(defaultFields)
  const [size, setSize] = useState(900)
  const [margin, setMargin] = useState(16)
  const [darkColor, setDarkColor] = useState("#000000")
  const [lightColor, setLightColor] = useState("#ffffff")
  const [errorCorrection, setErrorCorrection] = useState("Q")
  const [dotStyle, setDotStyle] = useState("rounded")
  const [cornerSquareStyle, setCornerSquareStyle] = useState("extra-rounded")
  const [cornerDotStyle, setCornerDotStyle] = useState("dot")
  const [fileName, setFileName] = useState("company-qr")
  const [showGuide] = useState(true)
  const [logoImage, setLogoImage] = useState("")
  const [hideBackgroundDots, setHideBackgroundDots] = useState(true)

  const qrRef = useRef<any>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const data = useMemo(
    () => buildQRData(type, (fields as any)[type]),
    [type, fields]
  )

  useEffect(() => {
    qrRef.current = new QRCodeStyling({
      width: 320,
      height: 320,
      type: "svg",
      data,
      image: logoImage || undefined,
      margin,
      qrOptions: {
        errorCorrectionLevel: errorCorrection,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 8,
        hideBackgroundDots,
        imageSize: 0.24,
      },
      dotsOptions: {
        color: darkColor,
        type: dotStyle,
      },
      cornersSquareOptions: {
        color: darkColor,
        type: cornerSquareStyle,
      },
      cornersDotOptions: {
        color: darkColor,
        type: cornerDotStyle,
      },
      backgroundOptions: {
        color: lightColor,
      },
    })

    if (wrapperRef.current) {
      wrapperRef.current.innerHTML = ""
      qrRef.current.append(wrapperRef.current)
    }
  }, [])

  useEffect(() => {
    if (!qrRef.current) return

    qrRef.current.update({
      width: 320,
      height: 320,
      data,
      image: logoImage || undefined,
      margin,
      qrOptions: { errorCorrectionLevel: errorCorrection },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 8,
        hideBackgroundDots,
        imageSize: 0.24,
      },
      dotsOptions: { color: darkColor, type: dotStyle },
      cornersSquareOptions: { color: darkColor, type: cornerSquareStyle },
      cornersDotOptions: { color: darkColor, type: cornerDotStyle },
      backgroundOptions: { color: lightColor },
    })
  }, [
    data,
    margin,
    darkColor,
    lightColor,
    errorCorrection,
    dotStyle,
    cornerSquareStyle,
    cornerDotStyle,
    logoImage,
    hideBackgroundDots,
  ])

  const updateField = (group: string, key: string, value: any) => {
    setFields((prev: any) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }))
  }

  const applyPreset = (preset: { dark: string; light: string }) => {
    setDarkColor(preset.dark)
    setLightColor(preset.light)
  }

  const downloadQR = async (format: "png" | "svg") => {
    if (!qrRef.current) return
    await qrRef.current.update({ width: size, height: size })
    await qrRef.current.download({
      name: fileName || "qr-code",
      extension: format,
    })
    await qrRef.current.update({ width: 320, height: 320 })
  }

  const renderTypeForm = () => {
    const current: any = (fields as any)[type]

    switch (type) {
      case "url":
        return (
          <FieldRow
            label="Website URL"
            value={current.url}
            placeholder="https://yourcompany.com"
            onChange={(v) => updateField(type, "url", v)}
          />
        )

      case "text":
        return (
          <MultiLineRow
            label="Text"
            value={current.text}
            placeholder="Type any message or code"
            onChange={(v) => updateField(type, "text", v)}
          />
        )

      case "email":
        return (
          <div className="grid min-w-0 gap-4">
            <FieldRow
              label="Email Address"
              value={current.email}
              placeholder="hello@company.com"
              onChange={(v) => updateField(type, "email", v)}
            />
            <FieldRow
              label="Subject"
              value={current.subject}
              placeholder="Enquiry"
              onChange={(v) => updateField(type, "subject", v)}
            />
            <MultiLineRow
              label="Body"
              value={current.body}
              placeholder="Type email body"
              onChange={(v) => updateField(type, "body", v)}
            />
          </div>
        )

      case "phone":
        return (
          <FieldRow
            label="Phone Number"
            value={current.phone}
            placeholder="+971500000000"
            onChange={(v) => updateField(type, "phone", v)}
          />
        )

      case "sms":
        return (
          <div className="grid min-w-0 gap-4">
            <FieldRow
              label="Phone Number"
              value={current.phone}
              placeholder="+971500000000"
              onChange={(v) => updateField(type, "phone", v)}
            />
            <MultiLineRow
              label="Message"
              value={current.message}
              placeholder="Type SMS message"
              onChange={(v) => updateField(type, "message", v)}
            />
          </div>
        )

      case "whatsapp":
        return (
          <div className="grid min-w-0 gap-4">
            <FieldRow
              label="WhatsApp Number"
              value={current.phone}
              placeholder="971500000000"
              onChange={(v) => updateField(type, "phone", v)}
            />
            <MultiLineRow
              label="Prefilled Message"
              value={current.message}
              placeholder="Hello, I would like to know more"
              onChange={(v) => updateField(type, "message", v)}
            />
          </div>
        )

      case "wifi":
        return (
          <div className="grid min-w-0 gap-4">
            <FieldRow
              label="Network Name (SSID)"
              value={current.ssid}
              placeholder="Office WiFi"
              onChange={(v) => updateField(type, "ssid", v)}
            />
            <FieldRow
              label="Password"
              value={current.password}
              placeholder="********"
              onChange={(v) => updateField(type, "password", v)}
            />
            <div className="grid min-w-0 gap-2">
              <Label>Encryption</Label>
              <Select
                value={current.encryption}
                onValueChange={(v) => updateField(type, "encryption", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Password</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border p-4">
              <div className="min-w-0">
                <Label>Hidden Network</Label>
                <p className="text-sm text-slate-500">
                  Enable if the SSID is hidden.
                </p>
              </div>
              <Switch
                checked={current.hidden}
                onCheckedChange={(v) => updateField(type, "hidden", v)}
              />
            </div>
          </div>
        )

      case "geo":
        return (
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <FieldRow
              label="Latitude"
              value={current.latitude}
              placeholder="25.2048"
              onChange={(v) => updateField(type, "latitude", v)}
            />
            <FieldRow
              label="Longitude"
              value={current.longitude}
              placeholder="55.2708"
              onChange={(v) => updateField(type, "longitude", v)}
            />
            <div className="min-w-0 md:col-span-2">
              <FieldRow
                label="Location Label"
                value={current.query}
                placeholder="Dubai Office"
                onChange={(v) => updateField(type, "query", v)}
              />
            </div>
          </div>
        )

      case "vcard":
        return (
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <FieldRow
              label="First Name"
              value={current.firstName}
              placeholder="John"
              onChange={(v) => updateField(type, "firstName", v)}
            />
            <FieldRow
              label="Last Name"
              value={current.lastName}
              placeholder="Doe"
              onChange={(v) => updateField(type, "lastName", v)}
            />
            <FieldRow
              label="Company"
              value={current.company}
              placeholder="Company LLC"
              onChange={(v) => updateField(type, "company", v)}
            />
            <FieldRow
              label="Job Title"
              value={current.title}
              placeholder="Marketing Manager"
              onChange={(v) => updateField(type, "title", v)}
            />
            <FieldRow
              label="Work Phone"
              value={current.phone}
              placeholder="+971500000000"
              onChange={(v) => updateField(type, "phone", v)}
            />
            <FieldRow
              label="Mobile"
              value={current.mobile}
              placeholder="+971500000000"
              onChange={(v) => updateField(type, "mobile", v)}
            />
            <FieldRow
              label="Email"
              value={current.email}
              placeholder="john@company.com"
              onChange={(v) => updateField(type, "email", v)}
            />
            <FieldRow
              label="Website"
              value={current.website}
              placeholder="https://company.com"
              onChange={(v) => updateField(type, "website", v)}
            />
            <div className="min-w-0 md:col-span-2">
              <FieldRow
                label="Address"
                value={current.address}
                placeholder="Dubai, UAE"
                onChange={(v) => updateField(type, "address", v)}
              />
            </div>
            <div className="min-w-0 md:col-span-2">
              <MultiLineRow
                label="Note"
                value={current.note}
                placeholder="Scan to save contact"
                onChange={(v) => updateField(type, "note", v)}
              />
            </div>
          </div>
        )

      case "event":
        return (
          <div className="grid min-w-0 gap-4">
            <FieldRow
              label="Event Title"
              value={current.title}
              placeholder="Annual Meeting"
              onChange={(v) => updateField(type, "title", v)}
            />
            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <FieldRow
                label="Start"
                type="datetime-local"
                value={current.start}
                onChange={(v) => updateField(type, "start", v)}
              />
              <FieldRow
                label="End"
                type="datetime-local"
                value={current.end}
                onChange={(v) => updateField(type, "end", v)}
              />
            </div>
            <FieldRow
              label="Location"
              value={current.location}
              placeholder="Dubai HQ"
              onChange={(v) => updateField(type, "location", v)}
            />
            <MultiLineRow
              label="Description"
              value={current.description}
              placeholder="Event description"
              onChange={(v) => updateField(type, "description", v)}
            />
          </div>
        )

      case "file":
        return (
          <FieldRow
            label="File URL"
            value={current.url}
            placeholder="https://example.com/file.pdf"
            onChange={(v) => updateField(type, "url", v)}
          />
        )

      case "app":
        return (
          <div className="grid min-w-0 gap-4">
            <FieldRow
              label="Apple App Store URL"
              value={current.ios}
              placeholder="https://apps.apple.com/..."
              onChange={(v) => updateField(type, "ios", v)}
            />
            <FieldRow
              label="Google Play URL"
              value={current.android}
              placeholder="https://play.google.com/..."
              onChange={(v) => updateField(type, "android", v)}
            />
            <FieldRow
              label="Fallback Website"
              value={current.fallback}
              placeholder="https://example.com/app"
              onChange={(v) => updateField(type, "fallback", v)}
            />
          </div>
        )

      case "company":
        return (
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <FieldRow
              label="Company Name"
              value={current.companyName}
              placeholder="Company LLC"
              onChange={(v) => updateField(type, "companyName", v)}
            />
            <FieldRow
              label="Website"
              value={current.website}
              placeholder="https://company.com"
              onChange={(v) => updateField(type, "website", v)}
            />
            <FieldRow
              label="Phone"
              value={current.phone}
              placeholder="+97140000000"
              onChange={(v) => updateField(type, "phone", v)}
            />
            <FieldRow
              label="Email"
              value={current.email}
              placeholder="hello@company.com"
              onChange={(v) => updateField(type, "email", v)}
            />
            <div className="min-w-0 md:col-span-2">
              <FieldRow
                label="Address"
                value={current.address}
                placeholder="Dubai, UAE"
                onChange={(v) => updateField(type, "address", v)}
              />
            </div>
            <FieldRow
              label="LinkedIn URL"
              value={current.linkedin}
              placeholder="https://linkedin.com/company/..."
              onChange={(v) => updateField(type, "linkedin", v)}
            />
            <FieldRow
              label="Instagram URL"
              value={current.instagram}
              placeholder="https://instagram.com/..."
              onChange={(v) => updateField(type, "instagram", v)}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <Badge className="mb-3 rounded-full px-3 py-1 text-xs">
              QR Studio • Free Tool
            </Badge>
            <div className="flex items-center">
              <img src="../public/favicon.png" width={96} />
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                QR Generator
              </h1>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
              Create print-ready QR codes for websites, contact cards, Wi-Fi,
              locations, events, apps, company profiles, files, and more. Export
              as PNG for digital use or SVG vector for professional printing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button className="rounded-2xl" onClick={() => downloadQR("png")}>
              <Download className="mr-2 h-4 w-4" /> Export PNG
            </Button>
            <Button
              variant="secondary"
              className="rounded-2xl"
              onClick={() => downloadQR("svg")}
            >
              <Download className="mr-2 h-4 w-4" /> Export SVG
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="min-w-0 space-y-6">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Choose QR Type</CardTitle>
                <CardDescription>
                  Select the content format you want to turn into a QR code.
                </CardDescription>
              </CardHeader>

              <CardContent className="min-w-0">
                <div className="w-full overflow-x-auto pb-2">
                  <div className="flex w-max gap-3">
                    {qrTypes.map((item) => {
                      const Icon = item.icon
                      const active = type === item.key

                      return (
                        <button
                          key={item.key}
                          onClick={() => setType(item.key)}
                          className={`flex min-w-[150px] flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white hover:border-slate-400"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <div className="text-sm font-medium">
                            {item.label}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Content Setup</CardTitle>
                <CardDescription>
                  Fill in the fields for the selected QR format.
                </CardDescription>
              </CardHeader>
              <CardContent className="min-w-0 space-y-4">
                {renderTypeForm()}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Design & Print Settings</CardTitle>
                <CardDescription>
                  Customize color, pattern, margin, logo, size, and print export
                  quality.
                </CardDescription>
              </CardHeader>

              <CardContent className="min-w-0">
                <Tabs defaultValue="style" className="w-full min-w-0">
                  <TabsList className="grid w-full grid-cols-3 rounded-2xl">
                    <TabsTrigger value="style">Style</TabsTrigger>
                    <TabsTrigger value="branding">Branding</TabsTrigger>
                    <TabsTrigger value="export">Export</TabsTrigger>
                  </TabsList>

                  <TabsContent value="style" className="mt-4 min-w-0 space-y-5">
                    <div className="grid min-w-0 gap-4 md:grid-cols-2">
                      <div className="grid min-w-0 gap-2">
                        <Label>Dark Color</Label>
                        <div className="flex min-w-0 gap-2">
                          <Input
                            type="color"
                            value={darkColor}
                            onChange={(e) => setDarkColor(e.target.value)}
                            className="h-11 w-16 p-1"
                          />
                          <Input
                            value={darkColor}
                            onChange={(e) => setDarkColor(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid min-w-0 gap-2">
                        <Label>Background Color</Label>
                        <div className="flex min-w-0 gap-2">
                          <Input
                            type="color"
                            value={lightColor}
                            onChange={(e) => setLightColor(e.target.value)}
                            className="h-11 w-16 p-1"
                          />
                          <Input
                            value={lightColor}
                            onChange={(e) => setLightColor(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 space-y-2">
                      <Label>Quick Color Presets</Label>
                      <div className="flex flex-wrap gap-2">
                        {colorPresets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => applyPreset(preset)}
                            className="rounded-full border px-4 py-2 text-sm hover:bg-slate-100"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid min-w-0 gap-4 md:grid-cols-3">
                      <div className="grid min-w-0 gap-2">
                        <Label>Dots Style</Label>
                        <Select value={dotStyle} onValueChange={setDotStyle}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rounded">Rounded</SelectItem>
                            <SelectItem value="dots">Dots</SelectItem>
                            <SelectItem value="classy">Classy</SelectItem>
                            <SelectItem value="classy-rounded">
                              Classy Rounded
                            </SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="extra-rounded">
                              Extra Rounded
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid min-w-0 gap-2">
                        <Label>Corner Square</Label>
                        <Select
                          value={cornerSquareStyle}
                          onValueChange={setCornerSquareStyle}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="dot">Dot</SelectItem>
                            <SelectItem value="extra-rounded">
                              Extra Rounded
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid min-w-0 gap-2">
                        <Label>Corner Dot</Label>
                        <Select
                          value={cornerDotStyle}
                          onValueChange={setCornerDotStyle}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="dot">Dot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid min-w-0 gap-4 md:grid-cols-2">
                      <div className="grid min-w-0 gap-2">
                        <Label>Quiet Zone / Margin: {margin}px</Label>
                        <Input
                          type="range"
                          min="0"
                          max="40"
                          step="1"
                          value={margin}
                          onChange={(e) => setMargin(Number(e.target.value))}
                        />
                      </div>

                      <div className="grid min-w-0 gap-2">
                        <Label>Error Correction</Label>
                        <Select
                          value={errorCorrection}
                          onValueChange={setErrorCorrection}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">Low</SelectItem>
                            <SelectItem value="M">Medium</SelectItem>
                            <SelectItem value="Q">Quartile</SelectItem>
                            <SelectItem value="H">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="branding"
                    className="mt-4 min-w-0 space-y-5"
                  >
                    <FieldRow
                      label="Logo Image URL"
                      value={logoImage}
                      placeholder="https://yourcompany.com/logo.png"
                      onChange={setLogoImage}
                    />

                    <div className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border p-4">
                      <div className="min-w-0">
                        <Label>Hide Background Dots Behind Logo</Label>
                        <p className="text-sm text-slate-500">
                          Helps improve readability when placing a logo in the
                          center.
                        </p>
                      </div>
                      <Switch
                        checked={hideBackgroundDots}
                        onCheckedChange={setHideBackgroundDots}
                      />
                    </div>

                    <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                      For best print results, use a high-contrast design, keep
                      enough white margin around the code, and test scan after
                      adding a logo.
                    </p>
                  </TabsContent>

                  <TabsContent
                    value="export"
                    className="mt-4 min-w-0 space-y-5"
                  >
                    <div className="grid min-w-0 gap-4 md:grid-cols-2">
                      <div className="grid min-w-0 gap-2">
                        <Label>Export File Name</Label>
                        <Input
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          placeholder="company-qr"
                        />
                      </div>

                      <div className="grid min-w-0 gap-2">
                        <Label>Export Size: {size}px</Label>
                        <Input
                          type="range"
                          min="512"
                          max="2000"
                          step="64"
                          value={size}
                          onChange={(e) => setSize(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="grid min-w-0 gap-3 rounded-2xl border p-4 text-sm text-slate-600">
                      <p>
                        <strong>PNG</strong> is great for websites, WhatsApp
                        sharing, presentations, and most digital use.
                      </p>
                      <p>
                        <strong>SVG</strong> is vector-based and recommended for
                        signage, brochures, packaging, labels, and large-format
                        printing.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="min-w-0 space-y-6">
            <Card className="sticky top-6 rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <div className="flex min-w-0 items-center justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>
                      Review the QR code before export.
                    </CardDescription>
                  </div>
                  <QrCode className="h-5 w-5 shrink-0 text-slate-500" />
                </div>
              </CardHeader>

              <CardContent className="min-w-0 space-y-5">
                <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-inner">
                  <div
                    ref={wrapperRef}
                    className="flex min-h-[320px] items-center justify-center overflow-hidden"
                  />
                </div>

                <div className="grid min-w-0 gap-2">
                  <Label>Encoded Data</Label>
                  <Textarea
                    value={data}
                    readOnly
                    rows={8}
                    className="w-full min-w-0 font-mono text-xs break-all whitespace-pre-wrap"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    className="rounded-2xl"
                    onClick={() => downloadQR("png")}
                  >
                    Export PNG
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-2xl"
                    onClick={() => downloadQR("svg")}
                  >
                    Export SVG
                  </Button>
                </div>

                {showGuide && (
                  <>
                    <Separator />
                    <Accordion type="single" collapsible defaultValue="tips">
                      <AccordionItem value="tips">
                        <AccordionTrigger>Company use cases</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                            <li>Business cards with employee vCards</li>
                            <li>
                              Product packaging linking to manuals or videos
                            </li>
                            <li>Wi-Fi access cards for guests and events</li>
                            <li>
                              Event posters with location and calendar signup
                            </li>
                            <li>
                              Reception desks linking to company profile or
                              catalog PDF
                            </li>
                            <li>
                              Invoices, proposals, and brochures linking to
                              approval or payment pages
                            </li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="print">
                        <AccordionTrigger>
                          Print recommendations
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                            <li>
                              Prefer SVG for print and scale without quality
                              loss.
                            </li>
                            <li>
                              Keep high contrast between foreground and
                              background.
                            </li>
                            <li>
                              Avoid tiny sizes for busy QR payloads like vCards
                              and events.
                            </li>
                            <li>
                              Test scan from both iPhone and Android before
                              final production.
                            </li>
                            <li>
                              Do not place QR codes too close to other graphic
                              elements.
                            </li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="mt-10 border-t pt-6 text-center text-sm text-slate-500">
        Free QR Generator • Built with ❤️ by{" "}
        <span className="font-semibold text-slate-800">Saad Khan</span>
      </footer>
    </div>
  )
}
