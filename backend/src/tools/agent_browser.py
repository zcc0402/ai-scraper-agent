"""agent-browser CLI 工具封装"""

import json
import os
import subprocess
from typing import Optional
from pathlib import Path

from src.utils.config import settings


class AgentBrowserError(Exception):
    """agent-browser 操作异常"""
    pass


class AgentBrowserTool:
    """
    agent-browser CLI 封装
    
    使用 Ref 机制（@e1, @e2）定位元素，比传统 CSS 选择器更稳定
    支持自然语言驱动操作（通过 chat 命令）
    """
    
    def __init__(
        self,
        browser_path: Optional[str] = None,
        timeout: Optional[int] = None
    ):
        self.browser_path = browser_path or settings.AGENT_BROWSER_PATH
        self.timeout = timeout or settings.AGENT_BROWSER_TIMEOUT
        self._check_installation()
    
    def _check_installation(self):
        """检查 agent-browser 是否已安装"""
        try:
            result = subprocess.run(
                [self.browser_path, "--version"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode != 0:
                raise AgentBrowserError(
                    f"agent-browser 检查失败: {result.stderr}"
                )
        except FileNotFoundError:
            raise AgentBrowserError(
                f"找不到 agent-browser，请安装: npm install -g agent-browser"
            )
    
    def _run_command(
        self,
        cmd: list[str],
        timeout: Optional[int] = None
    ) -> dict:
        """执行 agent-browser CLI 命令"""
        full_cmd = [self.browser_path] + cmd
        timeout = timeout or self.timeout
        
        try:
            result = subprocess.run(
                full_cmd,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
                "returncode": result.returncode
            }
        except subprocess.TimeoutExpired:
            raise AgentBrowserError(f"命令超时 ({timeout}s): {' '.join(cmd)}")
        except Exception as e:
            raise AgentBrowserError(f"执行命令失败: {e}")
    
    def open_url(self, url: str) -> dict:
        """导航到指定 URL"""
        result = self._run_command(["open", url])
        
        if not result["success"]:
            raise AgentBrowserError(f"打开 URL 失败: {result['stderr']}")
        
        return {
            "action": "open_url",
            "url": url,
            "success": True
        }
    
    def snapshot(self, interactive: bool = True) -> dict:
        """
        获取页面快照（包含元素的 Ref）
        这是 agent-browser 的核心功能
        """
        cmd = ["snapshot", "--json"]
        if interactive:
            cmd.insert(1, "-i")
        
        result = self._run_command(cmd)
        
        if not result["success"]:
            raise AgentBrowserError(f"获取快照失败: {result['stderr']}")
        
        try:
            snapshot_data = json.loads(result["stdout"])
            return {
                "action": "snapshot",
                "success": True,
                "data": snapshot_data
            }
        except json.JSONDecodeError:
            return {
                "action": "snapshot",
                "success": True,
                "raw_output": result["stdout"]
            }
    
    def click(self, ref: str) -> dict:
        """通过 Ref 点击元素"""
        result = self._run_command(["click", ref])
        
        if not result["success"]:
            raise AgentBrowserError(f"点击元素失败: {result['stderr']}")
        
        return {
            "action": "click",
            "ref": ref,
            "success": True
        }
    
    def type_text(self, ref: str, text: str) -> dict:
        """通过 Ref 在输入框中输入文本"""
        result = self._run_command(["type", ref, text])
        
        if not result["success"]:
            raise AgentBrowserError(f"输入文本失败: {result['stderr']}")
        
        return {
            "action": "type_text",
            "ref": ref,
            "text": text,
            "success": True
        }
    
    def extract(self, ref: str) -> dict:
        """通过 Ref 提取元素内容"""
        result = self._run_command(["extract", ref, "--json"])
        
        if not result["success"]:
            raise AgentBrowserError(f"提取内容失败: {result['stderr']}")
        
        try:
            data = json.loads(result["stdout"])
            return {
                "action": "extract",
                "ref": ref,
                "success": True,
                "data": data
            }
        except json.JSONDecodeError:
            return {
                "action": "extract",
                "ref": ref,
                "success": True,
                "raw_output": result["stdout"]
            }
    
    def scroll(self, direction: str = "down") -> dict:
        """滚动页面"""
        result = self._run_command(["scroll", direction])
        
        if not result["success"]:
            raise AgentBrowserError(f"滚动失败: {result['stderr']}")
        
        return {
            "action": "scroll",
            "direction": direction,
            "success": True
        }
    
    def chat(self, instruction: str, interactive: bool = False) -> dict:
        """
        自然语言驱动浏览器操作
        
        这是 agent-browser 最强大的功能，直接用自然语言告诉 AI 要做什么
        """
        if interactive:
            process = subprocess.Popen(
                [self.browser_path, "chat"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            try:
                stdout, stderr = process.communicate(
                    input=instruction,
                    timeout=self.timeout
                )
                
                return {
                    "action": "chat",
                    "instruction": instruction,
                    "success": process.returncode == 0,
                    "output": stdout.strip(),
                    "error": stderr.strip()
                }
            except subprocess.TimeoutExpired:
                process.kill()
                raise AgentBrowserError(f"交互模式超时 ({self.timeout}s)")
        else:
            result = self._run_command(["chat", instruction])
            
            return {
                "action": "chat",
                "instruction": instruction,
                "success": result["success"],
                "output": result["stdout"],
                "error": result["stderr"]
            }
    
    def wait(self, milliseconds: int = 1000) -> dict:
        """等待指定时间"""
        result = self._run_command(["wait", str(milliseconds)])
        
        return {
            "action": "wait",
            "milliseconds": milliseconds,
            "success": result["success"]
        }
    
    def close(self) -> dict:
        """关闭浏览器"""
        result = self._run_command(["close"])
        
        return {
            "action": "close",
            "success": result["success"]
        }
