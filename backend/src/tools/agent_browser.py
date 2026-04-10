"""agent-browser CLI 工具封装"""

import json
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
    
    agent-browser 是 Vercel 开发的 AI 原生浏览器自动化工具
    使用 Ref 机制（@e1, @e2）定位元素，比传统 CSS 选择器更稳定
    """
    
    def __init__(
        self,
        browser_path: Optional[str] = None,
        timeout: Optional[int] = None
    ):
        """
        初始化 agent-browser 工具
        
        Args:
            browser_path: agent-browser CLI 路径（默认从配置读取）
            timeout: 超时时间（秒，默认从配置读取）
        """
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
        """
        执行 agent-browser CLI 命令
        
        Args:
            cmd: 命令参数列表
            timeout: 超时时间（秒）
            
        Returns:
            dict: {
                "success": bool,
                "stdout": str,
                "stderr": str,
                "returncode": int
            }
        """
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
        """
        导航到指定 URL
        
        Args:
            url: 目标网址
            
        Returns:
            执行结果
        """
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
        
        这是 agent-browser 的核心功能，生成页面可交互元素的快照，
        每个元素分配唯一的 Ref（如 @e1, @e2），用于后续操作
        
        Args:
            interactive: 是否只包含可交互元素
            
        Returns:
            页面快照数据（包含 refs）
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
        """
        通过 Ref 点击元素
        
        Args:
            ref: 元素引用（如 @e5）
            
        Returns:
            执行结果
        """
        result = self._run_command(["click", ref])
        
        if not result["success"]:
            raise AgentBrowserError(f"点击元素失败: {result['stderr']}")
        
        return {
            "action": "click",
            "ref": ref,
            "success": True
        }
    
    def type_text(self, ref: str, text: str) -> dict:
        """
        通过 Ref 在输入框中输入文本
        
        Args:
            ref: 元素引用（如 @e3）
            text: 要输入的文本
            
        Returns:
            执行结果
        """
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
        """
        通过 Ref 提取元素内容
        
        Args:
            ref: 元素引用（如 @e10）
            
        Returns:
            元素内容
        """
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
        """
        滚动页面
        
        Args:
            direction: 滚动方向（up, down, left, right）
            
        Returns:
            执行结果
        """
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
        
        这是 agent-browser 最强大的功能，直接用自然语言告诉 AI 要做什么，
        AI 会自动分析页面并执行相应操作
        
        Args:
            instruction: 操作指令（自然语言）
            interactive: 是否使用交互模式（长时间任务）
            
        Returns:
            执行结果和提取的数据
        """
        if interactive:
            # 交互模式（适用于复杂的多步骤任务）
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
            # 单次执行模式
            result = self._run_command(["chat", instruction])
            
            return {
                "action": "chat",
                "instruction": instruction,
                "success": result["success"],
                "output": result["stdout"],
                "error": result["stderr"]
            }
    
    def screenshot(self, output_path: Optional[str] = None) -> dict:
        """
        截取页面截图
        
        Args:
            output_path: 截图保存路径（可选）
            
        Returns:
            截图路径或数据
        """
        cmd = ["screenshot"]
        if output_path:
            cmd.extend(["--output", output_path])
        else:
            cmd.append("--json")
        
        result = self._run_command(cmd)
        
        if not result["success"]:
            raise AgentBrowserError(f"截图失败: {result['stderr']}")
        
        if output_path:
            return {
                "action": "screenshot",
                "success": True,
                "path": output_path
            }
        else:
            try:
                data = json.loads(result["stdout"])
                return {
                    "action": "screenshot",
                    "success": True,
                    "data": data
                }
            except json.JSONDecodeError:
                return {
                    "action": "screenshot",
                    "success": True,
                    "raw_output": result["stdout"]
                }
    
    def wait(self, milliseconds: int = 1000) -> dict:
        """
        等待指定时间
        
        Args:
            milliseconds: 等待时间（毫秒）
            
        Returns:
            执行结果
        """
        result = self._run_command(["wait", str(milliseconds)])
        
        return {
            "action": "wait",
            "milliseconds": milliseconds,
            "success": result["success"]
        }
    
    def close(self) -> dict:
        """
        关闭浏览器
        
        Returns:
            执行结果
        """
        result = self._run_command(["close"])
        
        return {
            "action": "close",
            "success": result["success"]
        }
