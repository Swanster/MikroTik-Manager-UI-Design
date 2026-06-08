import { useState } from "react";
import {
  Wifi, Eye, EyeOff, Info, AlertTriangle, ChevronRight,
  Globe, Shield, Users, Settings as SettingsIcon, Network, Clock,
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

  // WAN state
  const [wanType, setWanType] = useState<"dhcp" | "static" | "pppoe">("dhcp");
  const [wanStaticIp, setWanStaticIp] = useState("203.0.113.5");
  const [wanGateway, setWanGateway] = useState("203.0.113.1");
  const [wanDns1, setWanDns1] = useState("1.1.1.1");
  const [wanDns2, setWanDns2] = useState("8.8.8.8");
  const [pppoeUser, setPppoeUser] = useState("");
  const [pppoePass, setPppoePass] = useState("");
  const [showPppoePass, setShowPppoePass] = useState(false);

  // LAN/DHCP state
  const [lanIp, setLanIp] = useState("192.168.1.1");
  const [lanSubnet, setLanSubnet] = useState("24");
  const [dhcpEnabled, setDhcpEnabled] = useState(true);
  const [dhcpPoolStart, setDhcpPoolStart] = useState("192.168.1.10");
  const [dhcpPoolEnd, setDhcpPoolEnd] = useState("192.168.1.200");
  const [dhcpLeaseTime, setDhcpLeaseTime] = useState("1d");
  const [dhcpDns, setDhcpDns] = useState("1.1.1.1,8.8.8.8");

  // Firewall state
  const [fwNatEnabled, setFwNatEnabled] = useState(true);
  const [fwInputPolicy, setFwInputPolicy] = useState<"accept" | "drop">("drop");
  const [fwAllowPing, setFwAllowPing] = useState(true);
  const [fwAllowSsh, setFwAllowSsh] = useState(true);
  const [fwAllowWinbox, setFwAllowWinbox] = useState(true);
  const [fwPortForwards, setFwPortForwards] = useState([
    { name: "HTTP", port: "80", target: "192.168.1.100", enabled: true },
    { name: "HTTPS", port: "443", target: "192.168.1.100", enabled: true },
  ]);

  // Users state
  const [users] = useState([
    { name: "admin", group: "full", lastLogin: "2h ago", active: true },
    { name: "readonly", group: "read", lastLogin: "3d ago", active: true },
    { name: "backup-user", group: "read", lastLogin: "Never", active: false },
  ]);
  const [newUserName, setNewUserName] = useState("");
  const [newUserGroup, setNewUserGroup] = useState<"full" | "read" | "write">("read");

  // System state
  const [deviceName, setDeviceName] = useState("Core Router");
  const [ntpEnabled, setNtpEnabled] = useState(true);
  const [ntpServer, setNtpServer] = useState("pool.ntp.org");
  const [timezone, setTimezone] = useState("Asia/Makassar");
  const [firmwareVersion] = useState("7.16.3");
  const [firmwareChannel, setFirmwareChannel] = useState<"stable" | "long-term">("stable");

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
        ) : activeSection === "wan" ? (
          <>
            <div style={{ flex: 1, overflow: "auto", paddingBottom: 100 }}>
              <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: t.text, margin: 0 }}>Internet / WAN</h2>
                  <p style={{ fontSize: 13, color: t.textMuted, margin: "6px 0 0" }}>Configure your internet connection</p>
                </div>
                <SettingsCard isDark={isDark} icon={<Globe size={18} color={t.accent} />} title="WAN Connection Type">
                  <SettingsToggle isDark={isDark} options={[{ value: "dhcp", label: "DHCP Client" }, { value: "static", label: "Static IP" }, { value: "pppoe", label: "PPPoE" }]} value={wanType} onChange={(v) => setWanType(v as typeof wanType)} help="DHCP is most common for home ISPs. Use Static IP if your ISP assigned one. PPPoE is for ADSL/VDSL connections." />
                  {wanType === "static" && (
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                      <SettingsInput isDark={isDark} label="IP Address" value={wanStaticIp} onChange={setWanStaticIp} mono />
                      <SettingsInput isDark={isDark} label="Gateway" value={wanGateway} onChange={setWanGateway} mono />
                    </div>
                  )}
                  {wanType === "pppoe" && (
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                      <SettingsInput isDark={isDark} label="PPPoE Username" value={pppoeUser} onChange={setPppoeUser} />
                      <SettingsInput isDark={isDark} label="PPPoE Password" value={pppoePass} onChange={setPppoePass} type={showPppoePass ? "text" : "password"} showToggle onToggle={() => setShowPppoePass(!showPppoePass)} toggleState={showPppoePass} />
                    </div>
                  )}
                </SettingsCard>
                <SettingsCard isDark={isDark} icon={<Globe size={18} color={t.green} />} title="DNS Servers">
                  <SettingsInput isDark={isDark} label="Primary DNS" value={wanDns1} onChange={setWanDns1} mono help="Cloudflare DNS — fast and privacy-focused." />
                  <div style={{ marginTop: 14 }}>
                    <SettingsInput isDark={isDark} label="Secondary DNS" value={wanDns2} onChange={setWanDns2} mono help="Google DNS — reliable fallback." />
                  </div>
                </SettingsCard>
                {mode === "beginner" && <SettingsHelp isDark={isDark} title="What is WAN?" text="WAN (Wide Area Network) is your internet connection. Most home ISPs use DHCP, which automatically assigns your IP address. Only change these settings if your ISP specifically told you to." />}
              </div>
            </div>
            <SettingsBottomBar isDark={isDark} warning="Changing WAN settings may disconnect your internet temporarily" />
          </>
        ) : activeSection === "lan" ? (
          <>
            <div style={{ flex: 1, overflow: "auto", paddingBottom: 100 }}>
              <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: t.text, margin: 0 }}>LAN / DHCP Server</h2>
                  <p style={{ fontSize: 13, color: t.textMuted, margin: "6px 0 0" }}>Configure your local network and DHCP settings</p>
                </div>
                <SettingsCard isDark={isDark} icon={<Network size={18} color={t.accent} />} title="LAN Interface">
                  <SettingsInput isDark={isDark} label="LAN IP Address" value={lanIp} onChange={setLanIp} mono help="This is the gateway address for devices on your local network." />
                  <div style={{ marginTop: 14 }}>
                    <SettingsInput isDark={isDark} label="Subnet Mask (/prefix)" value={lanSubnet} onChange={setLanSubnet} mono help="/24 = 255.255.255.0 — supports up to 254 devices." />
                  </div>
                </SettingsCard>
                <SettingsCard isDark={isDark} icon={<Network size={18} color={t.amber} />} title="DHCP Server" toggle={{ enabled: dhcpEnabled, onChange: setDhcpEnabled }}>
                  {dhcpEnabled && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <SettingsInput isDark={isDark} label="Pool Start" value={dhcpPoolStart} onChange={setDhcpPoolStart} mono />
                      <SettingsInput isDark={isDark} label="Pool End" value={dhcpPoolEnd} onChange={setDhcpPoolEnd} mono />
                      <SettingsInput isDark={isDark} label="Lease Time" value={dhcpLeaseTime} onChange={setDhcpLeaseTime} help="How long a device keeps its IP. Use 1d (1 day) for most networks." />
                      <SettingsInput isDark={isDark} label="DNS Servers (for clients)" value={dhcpDns} onChange={setDhcpDns} mono help="DNS servers handed out to DHCP clients." />
                    </div>
                  )}
                </SettingsCard>
                {mode === "beginner" && <SettingsHelp isDark={isDark} title="What is DHCP?" text="DHCP automatically assigns IP addresses to devices on your network. When a phone or laptop connects, the DHCP server gives it an address from the pool. The lease time controls how long that assignment lasts." />}
              </div>
            </div>
            <SettingsBottomBar isDark={isDark} warning="Changing LAN IP will change how you access the router" />
          </>
        ) : activeSection === "firewall" ? (
          <>
            <div style={{ flex: 1, overflow: "auto", paddingBottom: 100 }}>
              <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: t.text, margin: 0 }}>Firewall & NAT</h2>
                  <p style={{ fontSize: 13, color: t.textMuted, margin: "6px 0 0" }}>Control what traffic is allowed into and out of your network</p>
                </div>
                <SettingsCard isDark={isDark} icon={<Shield size={18} color={t.red} />} title="Input Chain Policy">
                  <SettingsToggle isDark={isDark} options={[{ value: "drop", label: "Drop (Recommended)" }, { value: "accept", label: "Accept (Open)" }]} value={fwInputPolicy} onChange={(v) => setFwInputPolicy(v as typeof fwInputPolicy)} help="Drop blocks all unsolicited traffic to the router. Accept allows everything — only use in lab environments." />
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    <SettingsCheckbox isDark={isDark} label="Allow ICMP (Ping)" checked={fwAllowPing} onChange={setFwAllowPing} />
                    <SettingsCheckbox isDark={isDark} label="Allow SSH from LAN" checked={fwAllowSsh} onChange={setFwAllowSsh} />
                    <SettingsCheckbox isDark={isDark} label="Allow Winbox from LAN" checked={fwAllowWinbox} onChange={setFwAllowWinbox} />
                  </div>
                </SettingsCard>
                <SettingsCard isDark={isDark} icon={<Shield size={18} color={t.green} />} title="NAT / Masquerade" toggle={{ enabled: fwNatEnabled, onChange: setFwNatEnabled }}>
                  <p style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.5, margin: 0 }}>Masquerade allows LAN devices to share the WAN IP for internet access. This is required for most home networks.</p>
                </SettingsCard>
                <SettingsCard isDark={isDark} icon={<Globe size={18} color={t.amber} />} title="Port Forwarding">
                  {fwPortForwards.map((pf, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < fwPortForwards.length - 1 ? `1px solid ${t.border}` : "none" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: pf.enabled ? t.green : t.textSubtle }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{pf.name}</div>
                        <div style={{ fontSize: 10, color: t.textMuted, fontFamily: mono }}>:{pf.port} → {pf.target}</div>
                      </div>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: t.textMuted, margin: "10px 0 0", lineHeight: 1.5 }}>Port forwarding rules are configured in the Config editor for full control.</p>
                </SettingsCard>
                {mode === "beginner" && <SettingsHelp isDark={isDark} title="Firewall Safety" text="The firewall protects your router and network from unwanted traffic. Keep the input policy on 'Drop' and only allow services you actually use. NAT/Masquerade is what lets your LAN devices access the internet — don't disable it unless you know what you're doing." />}
              </div>
            </div>
            <SettingsBottomBar isDark={isDark} warning="Firewall changes can lock you out of the router" />
          </>
        ) : activeSection === "users" ? (
          <>
            <div style={{ flex: 1, overflow: "auto", paddingBottom: 100 }}>
              <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: t.text, margin: 0 }}>Users</h2>
                  <p style={{ fontSize: 13, color: t.textMuted, margin: "6px 0 0" }}>Manage router user accounts and access groups</p>
                </div>
                <SettingsCard isDark={isDark} icon={<Users size={18} color={t.accent} />} title="User Accounts">
                  {users.map((user, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < users.length - 1 ? `1px solid ${t.border}` : "none" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: user.group === "full" ? t.accentBg : t.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: user.group === "full" ? t.accent : t.textMuted }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{user.name}</div>
                        <div style={{ fontSize: 10, color: t.textMuted }}>Group: {user.group} · Last login: {user.lastLogin}</div>
                      </div>
                      <span style={{ padding: "2px 8px", borderRadius: 999, background: user.active ? t.greenBg : t.surface2, color: user.active ? t.greenText : t.textSubtle, fontSize: 10, fontWeight: 700 }}>
                        {user.active ? "Active" : "Disabled"}
                      </span>
                    </div>
                  ))}
                </SettingsCard>
                <SettingsCard isDark={isDark} icon={<Users size={18} color={t.amber} />} title="Add New User">
                  <SettingsInput isDark={isDark} label="Username" value={newUserName} onChange={setNewUserName} />
                  <div style={{ marginTop: 14 }}>
                    <SettingsToggle isDark={isDark} options={[{ value: "read", label: "Read-only" }, { value: "write", label: "Write" }, { value: "full", label: "Full" }]} value={newUserGroup} onChange={(v) => setNewUserGroup(v as typeof newUserGroup)} help="Read-only: view only. Write: change settings. Full: full admin access including user management." />
                  </div>
                </SettingsCard>
                {mode === "beginner" && <SettingsHelp isDark={isDark} title="User Groups" text="Full users can do everything, including creating other users. Write users can change settings but not manage users. Read-only users can only view the configuration. Always use the least-privilege account for daily work." />}
              </div>
            </div>
            <SettingsBottomBar isDark={isDark} warning="Removing users or changing groups affects who can access the router" />
          </>
        ) : activeSection === "system" ? (
          <>
            <div style={{ flex: 1, overflow: "auto", paddingBottom: 100 }}>
              <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: t.text, margin: 0 }}>System</h2>
                  <p style={{ fontSize: 13, color: t.textMuted, margin: "6px 0 0" }}>Device identity, time sync, and firmware</p>
                </div>
                <SettingsCard isDark={isDark} icon={<SettingsIcon size={18} color={t.accent} />} title="Device Identity">
                  <SettingsInput isDark={isDark} label="Device Name" value={deviceName} onChange={setDeviceName} help="This name appears in the sidebar and fleet dashboard." />
                </SettingsCard>
                <SettingsCard isDark={isDark} icon={<Clock size={18} color={t.green} />} title="Time Synchronization (NTP)" toggle={{ enabled: ntpEnabled, onChange: setNtpEnabled }}>
                  {ntpEnabled && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <SettingsInput isDark={isDark} label="NTP Server" value={ntpServer} onChange={setNtpServer} help="pool.ntp.org is recommended — it automatically picks the closest server." />
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 6 }}>Timezone</label>
                        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 7, color: t.text, fontSize: 13, fontFamily: "inherit", outline: "none" }}>
                          <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                          <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                          <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                    </div>
                  )}
                </SettingsCard>
                <SettingsCard isDark={isDark} icon={<SettingsIcon size={18} color={t.amber} />} title="Firmware">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: t.textMuted }}>Current Version</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: t.text, fontFamily: mono }}>RouterOS v{firmwareVersion}</div>
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: 999, background: t.greenBg, color: t.greenText, fontSize: 10, fontWeight: 700 }}>Up to date</span>
                  </div>
                  <SettingsToggle isDark={isDark} options={[{ value: "stable", label: "Stable" }, { value: "long-term", label: "Long-term" }]} value={firmwareChannel} onChange={(v) => setFirmwareChannel(v as typeof firmwareChannel)} help="Stable has latest features. Long-term has fewer updates but more tested." />
                </SettingsCard>
                {mode === "beginner" && <SettingsHelp isDark={isDark} title="System Settings" text="The device name helps you identify this router in the fleet view. NTP keeps the clock accurate — important for logs and scheduled tasks. Always keep firmware updated for security patches." />}
              </div>
            </div>
            <SettingsBottomBar isDark={isDark} warning="Changing device name will update across all views" />
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>Unknown section</p>
          </div>
        )}
      </div>
    </div>
  );
}

// === Reusable Settings Helper Components ===

function SettingsCard({ isDark, icon, title, children, toggle }: {
  isDark: boolean; icon: React.ReactNode; title: string; children: React.ReactNode;
  toggle?: { enabled: boolean; onChange: (v: boolean) => void };
}) {
  const t = getTheme(isDark);
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, boxShadow: t.shadow, padding: 24, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, margin: 0 }}>{title}</h3>
        </div>
        {toggle && (
          <label style={{ position: "relative", display: "inline-block", width: 44, height: 24, cursor: "pointer" }}>
            <input type="checkbox" checked={toggle.enabled} onChange={(e) => toggle.onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: toggle.enabled ? t.accent : t.surface2, borderRadius: 12, transition: "background 0.2s", border: `1px solid ${toggle.enabled ? t.accent : t.border}` }}>
              <span style={{ position: "absolute", left: toggle.enabled ? 22 : 2, top: 2, width: 18, height: 18, background: "#fff", borderRadius: "50%", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
            </span>
          </label>
        )}
      </div>
      {children}
    </div>
  );
}

function SettingsInput({ isDark, label, value, onChange, mono, help, type, showToggle, onToggle, toggleState }: {
  isDark: boolean; label: string; value: string; onChange: (v: string) => void;
  mono?: boolean; help?: string; type?: string;
  showToggle?: boolean; onToggle?: () => void; toggleState?: boolean;
}) {
  const t = getTheme(isDark);
  const monoFont = "'JetBrains Mono', monospace";
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type || "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", padding: "10px 12px", paddingRight: showToggle ? 40 : 12,
            background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 7,
            color: t.text, fontSize: 13, fontFamily: mono ? monoFont : "inherit",
            outline: "none", transition: "border-color 0.12s",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = t.accent; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = t.border; }}
        />
        {showToggle && onToggle && (
          <button type="button" onClick={onToggle} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: t.textMuted, cursor: "pointer", padding: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {toggleState ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {help && <p style={{ fontSize: 11, color: t.textMuted, margin: "6px 0 0", lineHeight: 1.5 }}>{help}</p>}
    </div>
  );
}

function SettingsToggle({ isDark, options, value, onChange, help }: {
  isDark: boolean; options: Array<{ value: string; label: string }>; value: string;
  onChange: (v: string) => void; help?: string;
}) {
  const t = getTheme(isDark);
  return (
    <div>
      <div style={{ display: "inline-flex", background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 7, padding: 3 }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: "8px 16px", background: value === opt.value ? t.accent : "transparent",
              border: "none", borderRadius: 5, color: value === opt.value ? "#fff" : t.textMuted,
              fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", transition: "all 0.12s",
            }}
          >{opt.label}</button>
        ))}
      </div>
      {help && <p style={{ fontSize: 11, color: t.textMuted, margin: "8px 0 0", lineHeight: 1.5 }}>{help}</p>}
    </div>
  );
}

function SettingsCheckbox({ isDark, label, checked, onChange }: {
  isDark: boolean; label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  const t = getTheme(isDark);
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? t.accent : t.border}`, background: checked ? t.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s" }}>
        {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ display: "none" }} />
      <span style={{ fontSize: 13, color: t.text }}>{label}</span>
    </label>
  );
}

function SettingsHelp({ isDark, title, text }: { isDark: boolean; title: string; text: string }) {
  const t = getTheme(isDark);
  return (
    <div style={{ display: "flex", gap: 12, padding: 16, background: isDark ? "rgba(47,111,237,0.08)" : "rgba(47,111,237,0.06)", border: `1px solid ${isDark ? "rgba(47,111,237,0.2)" : "rgba(47,111,237,0.15)"}`, borderRadius: 8, marginTop: 16 }}>
      <Info size={18} color={t.accent} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 4 }}>{title}</div>
        <p style={{ fontSize: 11, color: t.textMuted, margin: 0, lineHeight: 1.5 }}>{text}</p>
      </div>
    </div>
  );
}

function SettingsBottomBar({ isDark, warning }: { isDark: boolean; warning: string }) {
  const t = getTheme(isDark);
  return (
    <div style={{ position: "absolute", bottom: 0, left: 260, right: 0, background: t.surface, borderTop: `1px solid ${t.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 -2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <AlertTriangle size={14} color={t.amber} />
        <span style={{ fontSize: 11, color: t.textMuted }}>{warning}</span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ padding: "9px 18px", background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 7, color: t.text, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", transition: "all 0.12s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.textMuted; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; }}
        >Cancel</button>
        <button style={{ padding: "9px 24px", background: t.accent, border: "none", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", transition: "all 0.12s" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >Apply Changes</button>
      </div>
    </div>
  );
}
