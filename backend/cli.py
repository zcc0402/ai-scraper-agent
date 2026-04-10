"""CLI 入口 - 命令行爬虫工具"""

import sys
import argparse
from pathlib import Path
from datetime import datetime

from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.traceback import install

# 安装 rich 的异常追踪
install(show_locals=True)

console = Console()


def main():
    """CLI 主入口"""
    parser = argparse.ArgumentParser(
        description="AI Scraper Agent - 自然语言驱动的智能爬虫",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例用法:
  # 基础爬虫任务
  python cli.py "帮我抓取 Hacker News 前10条标题"
  
  # 指定输出格式
  python cli.py "抓取知乎热榜" --format csv
  
  # 指定输出目录
  python cli.py "抓取 GitHub Trending" -o ./my-data
  
  # 详细输出
  python cli.py "抓取 Product Hunt 今日产品" --verbose
        """
    )
    
    parser.add_argument(
        "prompt",
        type=str,
        help="自然语言爬虫指令"
    )
    
    parser.add_argument(
        "-f", "--format",
        type=str,
        choices=["json", "csv", "excel"],
        default="json",
        help="输出格式（默认: json）"
    )
    
    parser.add_argument(
        "-o", "--output",
        type=str,
        help="输出目录路径（默认使用配置中的路径）"
    )
    
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="显示详细输出"
    )
    
    args = parser.parse_args()
    
    # 显示欢迎信息
    console.print(Panel.fit(
        "[bold blue]AI Scraper Agent[/bold blue] v0.1.0\n"
        "[dim]自然语言驱动的智能爬虫[/dim]",
        padding=(1, 2)
    ))
    
    console.print(f"\n[bold]任务指令:[/bold] {args.prompt}")
    console.print(f"[bold]输出格式:[/bold] {args.format}")
    if args.output:
        console.print(f"[bold]输出目录:[/bold] {args.output}")
    
    try:
        # 导入 Crew（延迟导入以检查依赖）
        from src.agents.crew import ScraperCrew
        
        # 创建并执行 Crew
        crew = ScraperCrew(
            user_input=args.prompt,
            output_format=args.format,
            output_dir=args.output
        )
        
        console.print("\n")
        result = crew.execute()
        
        # 显示结果
        console.print("\n[bold green]✨ 任务完成！[/bold green]")
        console.print(f"[dim]结果已保存，耗时 {result['duration_seconds']:.2f} 秒[/dim]\n")
        
        return 0
        
    except ImportError as e:
        console.print(f"\n[yellow]⚠️  依赖未安装: {e}[/yellow]")
        console.print("[dim]请运行: uv sync[/dim]\n")
        return 1
        
    except Exception as e:
        console.print(f"\n[bold red]❌ 任务执行失败[/bold red]")
        console.print(f"[red]{str(e)}[/red]\n")
        if args.verbose:
            console.print_exception()
        return 1


if __name__ == "__main__":
    sys.exit(main())
