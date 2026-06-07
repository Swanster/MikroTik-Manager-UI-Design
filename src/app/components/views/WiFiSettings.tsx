import { useState } from "react";
import {
  Wifi, Eye, EyeOff, Info, AlertTriangle, ChevronRight,
  Globe, Shield, Users, Settings as SettingsIcon, Network,
} from "lucide-react";
import type { AppMode } from "../../types";
import { getTheme } from "../theme";

interface WiFiSettingsProps {
  isDark: boolean;
  mode: AppMode;
}

type SettingsSection = "wifi" | "wan" | "lan" | "firewall" | "users" | "system";

export function WiFiSettings({ isDark, mode }: WiFiSettingsProps) {
  const t = getTheme(isDark);
  const [activeSection, setActiveSection] = useState<SettingsSection>("wifi");
  const [ssid, setSsid] = useState("MyMikroTik");
  const [password, setPassword] = useState("SecurePassword123");
  const [showPassword, setShowPassword] = useState(false);
  const [band, setBand] = useState<"2.4" | "5">("5");
  const [channel, setChannel] = useState("auto");
  const [guestEnabled, setGuestEnabled] = useState(false);
  const [guestSsid, setGuestSsid] = useState("Guest-WiFi");
  const [guestPassword, setGuestPassword] = useState("");
  const [showGuestPassword, setShowGuestPassword] = useState(false);

  const ui = "'Inter', -apple-system, sans-serif";
  const mono = "'JetBrains Mono', monospace";

  const navItems: Array<{ id: SettingsSection; label: string; icon: React.ReactNode }> = [
    { id: "wifi", label: "Wi-Fi", icon: <Wifi size={16} /> },
    { id: "wan", label: "Internet / WAN", icon: <Globe size={16} /> },
    { id: "lan", label: "LAN / DHCP", icon: <Network size={16} /> },
    { id: "firewall", label: "Firewall & NAT", icon: <Shield size={16} /> },
    { id: "users", label: "Users", icon: <Users size={16} /> },
    { id: "system", label: "System", icon: <SettingsIcon size={16} /> },
  ];

  const channels24 = ["auto", "1", "6", "11"];
  const channels5 = ["auto", "36", "40", "44", "48", "149", "153", "157", "161"];

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: ui, background: t.bg }}>
      {/* Left Navigation */}
      <div
        style={{
          width: 260,
          background: t.surface,
          borderRight: `1px solid ${t.border}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${t.border}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, margin: 0 }}>
            Settings
          </h3>
          <p style={{ fontSize: 11, color: t.textMuted, margin: "4px 0 0" }}>
            Configure your router
          </p>
        </div>
        <div style={{ padding: 8, flex: 1 }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: activeSection === item.id ? t.accentBg : "transparent",
                border: activeSection === item.id ? `1px solid ${t.accent}40` : "1px solid transparent",
                borderRadius: 8,
                color: activeSection === item.id ? t.accentText : t.textMuted,
                fontSize: 13,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.12s",
                marginBottom: 2,
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.background = t.surface2;
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ display: "flex", color: "inherit" }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
              {activeSection === item.id && <ChevronRight size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {activeSection === "wifi" ? (
          <>
            {/* Content Area - Scrollable */}
            <div style={{ flex: 1, overflow: "auto", paddingBottom: 100 }}>
              <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: t.text, margin: 0 }}>
                    Wi-Fi Settings
                  </h2>
                  <p style={{ fontSize: 13, color: t.textMuted, margin: "6px 0 0" }}>
                    Configure your wireless network settings
                  </p>
                </div>

                {/* Main Wi-Fi Section */}
                <div
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    borderRadius: 10,
                    boxShadow: t.shadow,
                    padding: 24,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                    <Wifi size={18} color={t.accent} />
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, margin: 0 }}>
                      Primary Network
                    </h3>
                  </div>

                  {/* SSID */}
                  <div style={{ marginBottom: 20 }}>
                    <label
                      htmlFor="ssid"
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: t.text,
                        marginBottom: 6,
                      }}
                    >
                      Network Name (SSID)
                    </label>
                    <input
                      id="ssid"
                      type="text"
                      value={ssid}
                      onChange={(e) => setSsid(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: t.surface2,
                        border: `1px solid ${t.border}`,
                        borderRadius: 7,
                        color: t.text,
                        fontSize: 13,
                        fontFamily: "inherit",
                        outline: "none",
                        transition: "border-color 0.12s",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = t.accent; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = t.border; }}
                    />
                    <p style={{ fontSize: 11, color: t.textMuted, margin: "6px 0 0", lineHeight: 1.5 }}>
                      This is the name people will see when connecting to your Wi-Fi. Choose something recognizable.
                    </p>
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: 20 }}>
                    <label
                      htmlFor="password"
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: t.text,
                        marginBottom: 6,
                      }}
                    >
                      Wi-Fi Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          paddingRight: 40,
                          background: t.surface2,
                          border: `1px solid ${t.border}`,
                          borderRadius: 7,
                          color: t.text,
                          fontSize: 13,
                          fontFamily: mono,
                          outline: "none",
                          transition: "border-color 0.12s",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = t.accent; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = t.border; }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          color: t.textMuted,
                          cursor: "pointer",
                          padding: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p style={{ fontSize: 11, color: t.textMuted, margin: "6px 0 0", lineHeight: 1.5 }}>
                      Use at least 8 characters with a mix of letters, numbers, and symbols for better security.
                    </p>
                  </div>

                  {/* Band Selection */}
                  <div style={{ marginBottom: 20 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: t.text,
                        marginBottom: 6,
                      }}
                    >
                      Frequency Band
                    </label>
                    <div
                      style={{
                        display: "inline-flex",
                        background: t.surface2,
                        border: `1px solid ${t.border}`,
                        borderRadius: 7,
                        padding: 3,
                      }}
                    >
                      <button
                        onClick={() => setBand("2.4")}
                        style={{
                          padding: "8px 20px",
                          background: band === "2.4" ? t.accent : "transparent",
                          border: "none",
                          borderRadius: 5,
                          color: band === "2.4" ? "#fff" : t.textMuted,
                          fontSize: 13,
                          fontWeight: 600,
                          fontFamily: "inherit",
                          cursor: "pointer",
                          transition: "all 0.12s",
                        }}
                      >
                        2.4 GHz
                      </button>
                      <button
                        onClick={() => setBand("5")}
                        style={{
                          padding: "8px 20px",
                          background: band === "5" ? t.accent : "transparent",
                          border: "none",
                          borderRadius: 5,
                          color: band === "5" ? "#fff" : t.textMuted,
                          fontSize: 13,
                          fontWeight: 600,
                          fontFamily: "inherit",
                          cursor: "pointer",
                          transition: "all 0.12s",
                        }}
                      >
                        5 GHz
                      </button>
                    </div>
                    <p style={{ fontSize: 11, color: t.textMuted, margin: "6px 0 0", lineHeight: 1.5 }}>
                      <strong>2.4 GHz:</strong> Better range, works through walls. <strong>5 GHz:</strong> Faster speeds, less interference.
                    </p>
                  </div>

                  {/* Channel */}
                  <div>
                    <label
                      htmlFor="channel"
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: t.text,
                        marginBottom: 6,
                      }}
                    >
                      Channel
                    </label>
                    <select
                      id="channel"
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: t.surface2,
                        border: `1px solid ${t.border}`,
                        borderRadius: 7,
                        color: t.text,
                        fontSize: 13,
                        fontFamily: "inherit",
                        outline: "none",
                        cursor: "pointer",
                        transition: "border-color 0.12s",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = t.accent; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = t.border; }}
                    >
                      {(band === "2.4" ? channels24 : channels5).map((ch) => (
                        <option key={ch} value={ch}>
                          {ch === "auto" ? "Auto (recommended)" : `Channel ${ch}`}
                        </option>
                      ))}
                    </select>
                    <p style={{ fontSize: 11, color: t.textMuted, margin: "6px 0 0", lineHeight: 1.5 }}>
                      Leave on "Auto" to let the router pick the best channel. Manual selection can help if you experience interference.
                    </p>
                  </div>
                </div>

                {/* Guest Network */}
                <div
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    borderRadius: 10,
                    boxShadow: t.shadow,
                    padding: 24,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Users size={18} color={t.amber} />
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, margin: 0 }}>
                        Guest Network
                      </h3>
                    </div>
                    <label
                      style={{
                        position: "relative",
                        display: "inline-block",
                        width: 44,
                        height: 24,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={guestEnabled}
                        onChange={(e) => setGuestEnabled(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: guestEnabled ? t.accent : t.surface2,
                          borderRadius: 12,
                          transition: "background 0.2s",
                          border: `1px solid ${guestEnabled ? t.accent : t.border}`,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: guestEnabled ? 22 : 2,
                            top: 2,
                            width: 18,
                            height: 18,
                            background: "#fff",
                            borderRadius: "50%",
                            transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                          }}
                        />
                      </span>
                    </label>
                  </div>
                  <p style={{ fontSize: 11, color: t.textMuted, margin: "0 0 16px", lineHeight: 1.5 }}>
                    Create a separate network for visitors. Guests won't have access to your main network or devices.
                  </p>

                  {guestEnabled && (
                    <div
                      style={{
                        paddingTop: 16,
                        borderTop: `1px solid ${t.border}`,
                        animation: "fadeIn 0.2s ease-in",
                      }}
                    >
                      {/* Guest SSID */}
                      <div style={{ marginBottom: 16 }}>
                        <label
                          htmlFor="guest-ssid"
                          style={{
                            display: "block",
                            fontSize: 13,
                            fontWeight: 600,
                            color: t.text,
                            marginBottom: 6,
                          }}
                        >
                          Guest Network Name
                        </label>
                        <input
                          id="guest-ssid"
                          type="text"
                          value={guestSsid}
                          onChange={(e) => setGuestSsid(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            background: t.surface2,
                            border: `1px solid ${t.border}`,
                            borderRadius: 7,
                            color: t.text,
                            fontSize: 13,
                            fontFamily: "inherit",
                            outline: "none",
                            transition: "border-color 0.12s",
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = t.accent; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = t.border; }}
                        />
                      </div>

                      {/* Guest Password */}
                      <div>
                        <label
                          htmlFor="guest-password"
                          style={{
                            display: "block",
                            fontSize: 13,
                            fontWeight: 600,
                            color: t.text,
                            marginBottom: 6,
                          }}
                        >
                          Guest Password
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            id="guest-password"
                            type={showGuestPassword ? "text" : "password"}
                            value={guestPassword}
                            onChange={(e) => setGuestPassword(e.target.value)}
                            placeholder="Leave empty for open network"
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              paddingRight: 40,
                              background: t.surface2,
                              border: `1px solid ${t.border}`,
                              borderRadius: 7,
                              color: t.text,
                              fontSize: 13,
                              fontFamily: mono,
                              outline: "none",
                              transition: "border-color 0.12s",
                            }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = t.accent; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = t.border; }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowGuestPassword(!showGuestPassword)}
                            style={{
                              position: "absolute",
                              right: 8,
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "transparent",
                              border: "none",
                              color: t.textMuted,
                              cursor: "pointer",
                              padding: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {showGuestPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <p style={{ fontSize: 11, color: t.textMuted, margin: "6px 0 0", lineHeight: 1.5 }}>
                          Optional: Add a password or leave empty for an open guest network.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Box */}
                {mode === "beginner" && (
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: 16,
                      background: isDark ? "rgba(47,111,237,0.08)" : "rgba(47,111,237,0.06)",
                      border: `1px solid ${isDark ? "rgba(47,111,237,0.2)" : "rgba(47,111,237,0.15)"}`,
                      borderRadius: 8,
                      marginTop: 16,
                    }}
                  >
                    <Info size={18} color={t.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 4 }}>
                        Need help choosing settings?
                      </div>
                      <p style={{ fontSize: 11, color: t.textMuted, margin: 0, lineHeight: 1.5 }}>
                        For most homes, 5 GHz band with auto channel works best. Use 2.4 GHz if you need coverage in distant rooms or have older devices.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 260,
                right: 0,
                background: t.surface,
                borderTop: `1px solid ${t.border}`,
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 -2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={14} color={t.amber} />
                <span style={{ fontSize: 11, color: t.textMuted }}>
                  Applying changes may briefly disconnect Wi-Fi clients
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  style={{
                    padding: "9px 18px",
                    background: t.surface2,
                    border: `1px solid ${t.border}`,
                    borderRadius: 7,
                    color: t.text,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.textMuted; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; }}
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding: "9px 24px",
                    background: t.accent,
                    border: "none",
                    borderRadius: 7,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: t.surface2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {navItems.find((item) => item.id === activeSection)?.icon}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: t.text, margin: 0 }}>
              {navItems.find((item) => item.id === activeSection)?.label}
            </h3>
            <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>
              This section is not yet implemented
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
