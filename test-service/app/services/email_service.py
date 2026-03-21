import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self, smtp_host: str, smtp_port: int, smtp_user: str, smtp_password: str):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.smtp_user = smtp_user
        self.smtp_password = smtp_password
    
    async def send_report(
        self,
        to_email: str,
        client_name: str,
        test_title: str,
        report_buffer: BytesIO,
        report_format: str = "docx"
    ) -> bool:
        """Отправить отчет на email."""
        try:
            # Создаем сообщение
            msg = MIMEMultipart()
            msg["From"] = self.smtp_user
            msg["To"] = to_email
            msg["Subject"] = f"Отчет по тесту '{test_title}' для {client_name}"
            
            # Тело письма
            body = f"""
            Здравствуйте!
            
            Прилагаем отчет по тесту "{test_title}" для {client_name}.
            
            Отчет сгенерирован автоматически системой ПрофДНК.
            
            С уважением,
            Команда ПрофДНК
            """
            msg.attach(MIMEText(body, "plain"))
            
            # Прикрепляем файл
            part = MIMEBase("application", "vnd.openxmlformats-officedocument.wordprocessingml.document")
            report_buffer.seek(0)
            part.set_payload(report_buffer.read())
            encoders.encode_base64(part)
            
            safe_name = "".join(c if c.isalnum() or c in "._-" else "_" for c in f"{client_name}_{test_title}")[:180]
            filename = f"report_{safe_name}.{report_format}"
            part.add_header(
                "Content-Disposition",
                f'attachment; filename="{filename}"'
            )
            msg.attach(part)

            connect_kw: dict = {"hostname": self.smtp_host, "port": self.smtp_port}
            if self.smtp_port == 465:
                connect_kw["use_tls"] = True
            async with aiosmtplib.SMTP(**connect_kw) as smtp:
                if self.smtp_port == 587:
                    await smtp.starttls()
                await smtp.login(self.smtp_user, self.smtp_password)
                await smtp.send_message(msg)
            
            logger.info(f"Report sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

class MockEmailService:
    """Мок-сервис для тестирования (сохраняет файл локально)."""
    
    async def send_report(
        self,
        to_email: str,
        client_name: str,
        test_title: str,
        report_buffer: BytesIO,
        report_format: str = "docx"
    ) -> bool:
        """Сохраняет отчет локально вместо отправки email."""
        filename = f"report_{client_name}_{test_title}.{report_format}"
        with open(filename, "wb") as f:
            f.write(report_buffer.getvalue())
        logger.info(f"Mock: Report saved to {filename}")
        return True