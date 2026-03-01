const fs = require('fs')
const path = require('path')
const { sendMail } = require('../services/mailService')

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const resolveInviteImagePath = () => {
  const configuredPath = process.env.INVITE_EMAIL_IMAGE_PATH
  if (!configuredPath) {
    return null
  }

  if (configuredPath) {
    const absoluteConfiguredPath = path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(__dirname, '..', configuredPath)

    if (fs.existsSync(absoluteConfiguredPath)) {
      return absoluteConfiguredPath
    }
  }

  return null
}

const buildInviteTemplate = ({ joinUrl }) => {
  const inviteImagePath = resolveInviteImagePath()
  const inviteImageUrl = String(process.env.INVITE_EMAIL_IMAGE_URL || '').trim()
  const imageSrc = inviteImagePath ? 'cid:skillswap-invite-image' : inviteImageUrl

  if (imageSrc) {
    const html = `
      <div style="margin:0;padding:0;background:#edf6fc;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#edf6fc;padding:16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
                <tr>
                  <td style="padding:0;margin:0;line-height:0;">
                    <a href="${escapeHtml(joinUrl)}" style="text-decoration:none;display:block;">
                      <img src="${escapeHtml(imageSrc)}" alt="You're Invited to SkillSwap" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `

    const text = `You're Invited to SkillSwap!\n\nSign up now and use code SKILLSWAP15 to receive 15% off your first booking!\n\nJoin SkillSwap Today: ${joinUrl}`

    const attachments = inviteImagePath
      ? [
          {
            filename: path.basename(inviteImagePath),
            path: inviteImagePath,
            cid: 'skillswap-invite-image',
          },
        ]
      : []

    return { html, text, attachments }
  }

  const html = `
    <div style="margin:0;padding:0;background-color:#eef7fc;font-family:Georgia,'Times New Roman',serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef7fc;padding:16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #d4ebf7;border-radius:18px;overflow:hidden;">
              <tr>
                <td style="padding:20px 16px 18px;text-align:center;background:linear-gradient(180deg,#d5effb 0%,#f3fbff 100%);">
                  <div style="font-size:28px;line-height:1;margin-bottom:8px;">🤝</div>
                  <div style="margin:0;color:#145c7a;font-family:Arial,sans-serif;font-size:34px;font-weight:800;letter-spacing:0.5px;line-height:1;">SKILLSWAP</div>
                  <div style="margin-top:8px;color:#5389a3;font-family:Arial,sans-serif;font-size:18px;font-style:italic;">Empowering Learning &amp; Growth</div>
                </td>
              </tr>

              <tr>
                <td style="padding:28px 30px 10px;text-align:center;">
                  <h1 style="margin:0;color:#144d68;font-size:38px;line-height:1.2;font-weight:700;">You’re Invited to SkillSwap!</h1>
                  <div style="font-size:76px;line-height:1;margin:16px 0 8px;">🧑‍🏫🤝👩‍💻</div>
                </td>
              </tr>

              <tr>
                <td style="padding:8px 32px 10px;text-align:center;">
                  <p style="margin:0;color:#2f2f2f;font-size:18px;line-height:1.7;">
                    We're thrilled to invite you to explore <strong style="color:#1f6685;">SkillSwap</strong>, the ultimate platform where you can swap skills, share knowledge, and learn from one another. Whether you're looking to teach a craft, learn a new expertise, or simply connect with passionate learners, <strong style="color:#1f6685;">SkillSwap</strong> is the place for you!
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 48px 8px;">
                  <div style="border-top:2px dashed #d2eaf5;"></div>
                </td>
              </tr>

              <tr>
                <td style="padding:10px 32px 0;text-align:center;">
                  <p style="margin:0;color:#1e5f7d;font-size:26px;line-height:1.3;font-weight:700;">Special Invitation for You:</p>
                </td>
              </tr>

              <tr>
                <td style="padding:12px 32px 0;text-align:center;">
                  <p style="margin:0;color:#2f2f2f;font-size:22px;line-height:1.6;">
                    Sign up now and use code <strong style="color:#1f6685;">SKILLSWAP15</strong> to receive <br/>
                    <strong style="color:#1f6685;">15%</strong> off your first booking!
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 48px 10px;">
                  <div style="border-top:2px dashed #d2eaf5;"></div>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:12px 24px 0;">
                  <a href="${escapeHtml(joinUrl)}" style="display:inline-block;background:linear-gradient(180deg,#73cae8 0%,#37afd6 100%);border-radius:14px;padding:14px 30px;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;text-decoration:none;box-shadow:0 3px 0 rgba(25,132,167,0.35);">Join SkillSwap Today!</a>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 32px 30px;text-align:center;">
                  <p style="margin:0;color:#5a8ba3;font-size:18px;line-height:1.6;">
                    Warmly,<br/>
                    <strong style="color:#1f6685;">The SkillSwap Team</strong>
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:22px 32px 26px;background:linear-gradient(180deg,#f8fdff 0%,#deeff9 100%);border-top:1px dashed #d2eaf5;text-align:center;">
                  <p style="margin:0 0 10px;color:#1f6685;font-size:24px;font-weight:700;">🌐www.skillswap.com</p>
                  <p style="margin:0 0 14px;color:#567f92;font-size:18px;">hello@skillswap.com</p>
                  <p style="margin:0;color:#8f8f8f;font-size:14px;">Terms of Service&nbsp;&nbsp;|&nbsp;&nbsp;Privacy Policy</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `

  const text = `You're Invited to SkillSwap!\n\nWe're thrilled to invite you to explore SkillSwap, the ultimate platform where you can swap skills, share knowledge, and learn from one another.\n\nSpecial Invitation for You:\nSign up now and use code SKILLSWAP15 to receive 15% off your first booking!\n\nJoin SkillSwap Today: ${joinUrl}\n\nWarmly,\nThe SkillSwap Team\nwww.skillswap.com\nhello@skillswap.com`

  return { html, text, attachments: [] }
}

exports.sendInvitation = async (req, res, next) => {
  try {
    const { recipientName, recipientEmail } = req.body

    const name = String(recipientName || '').trim()
    if (!name) {
      return res.status(400).json({ message: 'Recipient name is required' })
    }

    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' })
    }

    const email = String(recipientEmail).trim().toLowerCase()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: 'Enter a valid recipient email' })
    }

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000'
    const joinUrl = `${frontendBase.replace(/\/$/, '')}/register`

    const { html, text, attachments } = buildInviteTemplate({ joinUrl })

    await sendMail({
      to: email,
      subject: `You're Invited to SkillSwap!`,
      html,
      text,
      attachments,
    })

    res.status(200).json({
      message: `Invitation sent successfully to ${email}`,
      invited: {
        name,
        email,
      },
    })
  } catch (error) {
    next(error)
  }
}
